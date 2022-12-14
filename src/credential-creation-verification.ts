import {
    Bls12381G2KeyPair,
    BbsBlsSignature2020,
    BbsBlsSignatureProof2020,
    deriveProof
  } from "@mattrglobal/jsonld-signatures-bbs";
import { extendContextLoader, sign, verify, purposes } from "jsonld-signatures";

import vc from '@digitalbazaar/vc';

import { defaultRandomSource } from "@stablelib/random"

import inputDocument from "./data/inputDocument.json";
import keyPairOptions from "./data/keyPair.json";
import exampleControllerDoc from "./data/controllerDocument.json";
import bbsContext from "./data/bbs.json";
import revealDocument from "./data/deriveProofFrame.json";
import citizenVocab from "./data/citizenVocab.json";
import credentialContext from "./data/credentialsContext.json";
import proofContext from "./data/proofContext.json";
import didContext from "./data/didContext.json";

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const documents: any = {
    "did:example:489398593#test": keyPairOptions,
    "did:key:zUC71tQakpP8J3N9JbtqXqmVdQf771pTdrcuDJSssqD4wEajisGEMfF4P8qpJDbVapSfgmpwZ5gKxvsgJk3PCKLeA1bWBWs2wSrz2bMCfZkTAftdkKJeBCHpWbZTJ6SzoSwM8pB": exampleControllerDoc,
    "https://w3id.org/security/bbs/v1": bbsContext,
    "https://w3id.org/citizenship/v1": citizenVocab,
    "https://www.w3.org/2018/credentials/v1": credentialContext,
    "https://w3id.org/security/suites/jws-2020/v1": proofContext,
    "https://www.w3.org/ns/did/v1": didContext
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

  if(url.startsWith('did:key')) {
    const fingerprint = url.substring(8).split('#')[0];
    const doc = await Bls12381G2KeyPair.fromFingerprint({fingerprint});
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

const main = async (): Promise<void> => {
  // Generate a did:key pair
  const testKeyPair = await Bls12381G2KeyPair.generate();
  const didKey = `did:key:${testKeyPair.fingerprint()}`

  //Import the example key pair
  const keyPair = await new Bls12381G2KeyPair(keyPairOptions);

  console.log("Input document");
  console.log(JSON.stringify(inputDocument, null, 2));
  console.log();

  //Sign the input document
  const signedDocument = await sign(inputDocument, {
    suite: new BbsBlsSignature2020({ key: keyPair }),
    purpose: new purposes.AssertionProofPurpose(),
    documentLoader
  });

  console.log("Input document with proof");
  console.log(JSON.stringify(signedDocument, null, 2));
  console.log();

  //Verify the proof
  let verified = await verify(signedDocument, {
    suite: new BbsBlsSignature2020(),
    purpose: new purposes.AssertionProofPurpose(),
    documentLoader
  });

  console.log("Verification result");
  console.log(JSON.stringify(verified, null, 2));
  console.log();

  //Derive a proof
  const derivedProof = await deriveProof(signedDocument, revealDocument, {
    suite: new BbsBlsSignatureProof2020(),
    documentLoader: documentLoader,
    nonce: defaultRandomSource.randomBytes(50)
  });

  console.log("Derived proof");
  console.log(JSON.stringify(derivedProof, null, 2));
  console.log();

  //Verify the derived proof
  verified = await verify(derivedProof, {
    suite: new BbsBlsSignatureProof2020(),
    purpose: new purposes.AssertionProofPurpose(),
    documentLoader
  });

  console.log("Verification result");
  console.log(JSON.stringify(verified, null, 2));
  console.log();

  const id = '1234';
  const holder = 'aaaa';
  const verifiableCredentials = [derivedProof];
  const presentation = vc.createPresentation({
    verifiableCredentials, id, holder
  });

  console.log("Verifiable Presentation");
  console.log(JSON.stringify(presentation, null, 2));
};

main();