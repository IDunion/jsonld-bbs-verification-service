"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var jsonld_signatures_1 = require("jsonld-signatures");
var keyPair_json_1 = require("./data/keyPair.json");
var controllerDocument_json_1 = require("./data/controllerDocument.json");
var bbs_json_1 = require("./data/bbs.json");
var citizenVocab_json_1 = require("./data/citizenVocab.json");
var credentialsContext_json_1 = require("./data/credentialsContext.json");
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
var documents = {
    "did:example:489398593#test": keyPair_json_1["default"],
    "did:example:489398593": controllerDocument_json_1["default"],
    "https://w3id.org/security/bbs/v1": bbs_json_1["default"],
    "https://w3id.org/citizenship/v1": citizenVocab_json_1["default"],
    "https://www.w3.org/2018/credentials/v1": credentialsContext_json_1["default"]
};
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
var customDocLoader = function (url) {
    var context = documents[url];
    if (context) {
        return {
            contextUrl: null,
            document: context,
            documentUrl: url // this is the actual context URL after redirects
        };
    }
    console.log("Attempted to remote load context : '".concat(url, "', please cache instead"));
    throw new Error("Attempted to remote load context : '".concat(url, "', please cache instead"));
};
//Extended document load that uses local contexts
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
var documentLoader = (0, jsonld_signatures_1.extendContextLoader)(customDocLoader);
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log(JSON.stringify(keyPair_json_1["default"], null, 2));
        return [2 /*return*/];
    });
}); };
main();
