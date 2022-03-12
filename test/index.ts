import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ISupportUkraine } from "../typechain";
import { BigNumber } from "@ethersproject/bignumber";
import log from "ololog";
import axios from "axios";
import { Bytes32, Uint256, Uint32, Address } from "soltypes";
import { BytesLike } from "ethers";

const example = "0x087183a411770a645A96cf2e31fA69Ab89e22F5E";
const ukraine = "0x165CD37b4C644C2921454429E7F9358d18A45e14";

export const sendRequest = async (url: string) => {
  const response: any = await axios
    .get(url)
    .then((result) => {
      return result.data;
    })
    .catch((error) => {
      return error;
    });

  return response;
};

describe("I Support Ukraine", () => {
  let iSupportUkraine: ISupportUkraine;
  let owner: SignerWithAddress;

  beforeEach(async () => {
    const ISupportUkraine = await ethers.getContractFactory("ISupportUkraine");
    [owner] = await ethers.getSigners();
    iSupportUkraine = await ISupportUkraine.deploy(
      "0x39b0bdd4b9bf03bf5b15951dd1e2ba18d1cca2038bf413be4851de1b528a49dd"
    );
  });

  it("Should set the right owner", async () => {
    expect(await iSupportUkraine.owner()).to.equal(await owner.address);
  });

  it("Should allow whitelist mint", async () => {
    await owner.sendTransaction({
      to: example,
      value: ethers.utils.parseEther("1.0"), // Sends exactly 1.0 ether
    });
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [example],
    });
    const signer = await ethers.getSigner(example);
    const proof: BytesLike[] = [
      "0x11470846972103cbf2c251e83e2499f8fbe25a6424dc17934c81271840db1cef",
      "0xc49b942f9a725fab9c08d4a6252eab55fe71209c11a0a95abe8d11853525c86d",
      "0x9a30aee98573043fb4b9802a4ab110e29be98a0238b09773679485b19504e9dd",
      "0xc3f441f3bbb5fd3a4fe5485361649ed4fcb6f022f81e7dc98bddc3f32e671cd5",
      "0x4923a3cc2b813554de95385210ea6a6e3e2af78a7807a231d1faafa6d11f974e",
      "0x74b1b7afb4fd25cdbf7cdb379c4adf9323651c4202fc6e874a639f585ef46042",
      "0x7f20955ddabef7fcb4299f61d57376fc6cc5c5b85b383f1b783e819ecb6194be",
      "0x805ac5d81bbcb7bc5bcd9a67becb50110d6f42fff19daa2ef3a28a81e6ff3026",
      "0xfe68c295f0a224949a25212893b81c57243f88713750630ec44d2f575b19eb24",
      "0x226bc9ffbb27b2ae8c79a1ed7b9e5b4b68950a89e99dbab6b6e73ca495dcdcb2",
      "0xb9c44b58729edf081e44deecc7ba8cbcf2a223614a73ff33f65fac0eac80dddc",
      "0x27828ab2fbca6afec380839a1e192b5a019bb64503e1929145666356c0d9c4c5",
      "0x950ca4506db91b881ecf335349df03c320952d1ba09e460bbc4f231274a0fbbd",
      "0x385d51367babf27c3fe830d64976e9e9affd29a50ab0d6d2121970a7c02747f1",
      "0xde2d2601929d64613d1c04ef046c041301eae2b39254ea04de5d676d58ae8ed3",
      "0x7c6969261cddab75d971bc975a7fcc0bf38fb09039a8e93038262f8c5ad89467",
    ];
    const whitelist: boolean = await iSupportUkraine
      .connect(signer)
      .verifyMerkleLeaf(signer.address, proof);
    expect(whitelist).to.be.equal(true);
    await expect(iSupportUkraine.connect(signer).whiteListMint(proof)).to.emit(
      iSupportUkraine,
      "Transfer"
    );
  });
});
