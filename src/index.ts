import {
    Bls12381G2KeyPair,
    BbsBlsSignature2020,
    BbsBlsSignatureProof2020
  } from "@mattrglobal/jsonld-signatures-bbs";
import { extendContextLoader, verify, purposes } from "jsonld-signatures";

import express from 'express';

import pino from 'pino';
import pinoHttp from 'pino-http';

import keyPairOptions from "./data/keyPair.json";
import exampleControllerDoc from "./data/controllerDocument.json";
import bbsContext from "./data/bbs.json";
import citizenVocab from "./data/citizenVocab.json";
import credentialContext from "./data/credentialsContext.json";
import proofContext from "./data/proofContext.json";
import didContext from "./data/didContext.json";
import nextcloudContext from "./data/nextcloudContext.json";

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const documents: any = {
    "did:example:489398593#test": keyPairOptions,
    "did:key:zUC71tQakpP8J3N9JbtqXqmVdQf771pTdrcuDJSssqD4wEajisGEMfF4P8qpJDbVapSfgmpwZ5gKxvsgJk3PCKLeA1bWBWs2wSrz2bMCfZkTAftdkKJeBCHpWbZTJ6SzoSwM8pB": exampleControllerDoc,
    "https://w3id.org/security/bbs/v1": bbsContext,
    "https://w3id.org/citizenship/v1": citizenVocab,
    "https://www.w3.org/2018/credentials/v1": credentialContext,
    "https://w3id.org/security/suites/jws-2020/v1": proofContext,
    "https://www.w3.org/ns/did/v1": didContext,
    "https://agents.labor.gematik.de/credential/nextcloudCredential": nextcloudContext,
  };
  
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const customDocLoader = async (url: string): Promise<any> => {
  const context = documents[url];

  if (context) {
    return {
      contextUrl: null, // this is for a context via a link header
      document: context, // this is the actual document that was loaded
      documentUrl: url // this is the actual context URL after redirects
    };
  }

  if(url.startsWith('did:key') && url.includes('#')) {
    const fingerprint = url.substring(8).split('#')[0];
    const doc = Bls12381G2KeyPair.fromFingerprint({fingerprint});
    return {
      contextUrl: null,
      documentUrl: url,
      document: {
        'id': url,
        'type': 'Bls12381G2Key2020',
        'controller': 'did:key:'+fingerprint,
        'publicKeyBase58': doc.publicKey
      }
    };
  } else if (url.startsWith('did:key')) {
    const fullUrl = url + '#' + url.substring(8);
    return {
      contextUrl: null,
      document: {
        '@context': 'https://w3id.org/security/v2',
        'id': url,
        'assertionMethod': [fullUrl],
        'authentication': [fullUrl]
      },
      documentUrl: url
    }
  }

  console.log(
    `Attempted to remote load context : '${url}', please cache instead`
  );
  throw new Error(
    `Attempted to remote load context : '${url}', please cache instead`
  );
};

//Extended document load that uses local contexts
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const documentLoader: any = extendContextLoader(customDocLoader);

const main = async (body: any): Promise<Boolean> => {

  // Remove presentation_submission because it is not signed
  const credentialPrepared = { ...body.credential }  as Partial<any>;
  delete credentialPrepared.presentation_submission;

  //Verify the presentation
  let verifiedPresentation = await verify(credentialPrepared, {
    suite: new BbsBlsSignature2020(),
    purpose: new purposes.AuthenticationProofPurpose({challenge: body.challenge}),
    documentLoader
  });

  logger.trace(`Verification result of Verifiable Presentation:\n ${JSON.stringify(verifiedPresentation, null, 2)}`);

  //Verify the credential
  let verifiedCredential = await verify(credentialPrepared.verifiableCredential[0], {
    suite: new BbsBlsSignatureProof2020(),
    purpose: new purposes.AssertionProofPurpose(),
    documentLoader
  });

  logger.trace(`Verification result of derived Verifiable Credential:\n ${JSON.stringify(verifiedCredential, null, 2)}`);

  return verifiedCredential.verified && verifiedPresentation.verified;
};

const app = express();
const port = process.env.PORT || 4000;
const bearerTokenSecret = process.env.BEARER_TOKEN_SECRET || 'secret';

app.use(express.json());
app.use(pinoHttp());

function authorization(req: any, res: any, next: any) {
  const bearerHeader = req.headers['authorization'];
  if (bearerHeader !== undefined) {
    const bearerToken = bearerHeader.split(' ')[1];
    if (bearerToken == bearerTokenSecret) {
      next();
    } else {
      res.sendStatus(403);
    }
  } else  {
    res.sendStatus(403);
  }
}

app.post('/w3c/verification', authorization, async (req, res) => {
  logger.debug(`Post body:\n ${JSON.stringify(req.body, null, 2)}`);
  const verified = await main(req.body);
  logger.debug(`Verification result: ${verified}`);
  res.json({'verified': verified});
});

app.listen(port, () => {
  return logger.info(`Express is listening at http://localhost:${port}`);
});
