const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const { ethers } = require("ethers");

const members = [
  "0x92Bb439374a091c7507bE100183d8D1Ed2c9dAD3",
  "0xD0d82c095d184e6E2c8B72689c9171DE59FFd28d",
  "0xFD78F7E2dF2B8c3D5bff0413c96f3237500898B3",
];

const hashedLeafs = members.map(l => ethers.utils.solidityKeccak256(["address", "uint256"], [l, 0]));

const tree = new MerkleTree(hashedLeafs, keccak256, {
  sort: true,
  sortLeaves: true,
  sortPairs: true,
});

const expectedProof = tree.getHexProof(ethers.utils.solidityKeccak256(["address", "uint256"], [members[0], 0]));

process.stdout.write(ethers.utils.defaultAbiCoder.encode(["bytes32[]"], [expectedProof]));
