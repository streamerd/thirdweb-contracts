import { ethers } from "hardhat";
import { expect } from "chai";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { hexZeroPad } from "@ethersproject/bytes";
import { DropERC721 } from "typechain/DropERC721";
import { IDropClaimCondition } from "typechain/IDropERC721";

import { MerkleTree } from "merkletreejs";

describe("DropERC721: there is an allowlist, and allowlist specifies quantity restriction.", function() {

    let contractAdmin: SignerWithAddress;
    let claimer: SignerWithAddress;
    
    let dropERC721Impl: DropERC721;
    let dropERC721: DropERC721;
    const twFeeAddress: string = ethers.constants.AddressZero;

    let claimConditions: IDropClaimCondition.ClaimConditionStruct[];

    beforeEach(async () => {

        // Get signers
        const signers: SignerWithAddress[] = await ethers.getSigners();
        [contractAdmin, claimer] = signers;

        // Deploy contract
        dropERC721Impl = await ethers.getContractFactory("DropERC721").then(f => f.deploy(twFeeAddress));

        // Initialize contract
        const initializeData = dropERC721Impl.interface.encodeFunctionData("initialize", [
            contractAdmin.address,
            "",
            "",
            "",
            [ethers.constants.AddressZero],
            contractAdmin.address,
            contractAdmin.address,
            0,
            0,
            contractAdmin.address
        ])
        dropERC721 = await ethers.getContractFactory("TWProxy").then(f => f.deploy(
            dropERC721Impl.address,
            initializeData
        )) as DropERC721;
    })

    describe("No allowlist", function() {

        const quantityLimitPerTransaction = 5

        beforeEach(async () => {
            // Contract admin sets claim condition.
            claimConditions = [{
                startTimestamp: 0,
                maxClaimableSupply: 5,
                supplyClaimed: 0,
                quantityLimitPerTransaction: quantityLimitPerTransaction,
                waitTimeInSecondsBetweenClaims: ethers.constants.MaxUint256,
                merkleRoot: ethers.utils.formatBytes32String(""),
                pricePerToken: 0,
                currency: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
            }]

            // Set claim conditions
            const functionData_setClaimConditions = dropERC721Impl.interface.encodeFunctionData("setClaimConditions", [claimConditions, false]);
            await contractAdmin.sendTransaction({
                to: dropERC721.address,
                data: functionData_setClaimConditions  
            })

            // Lazy mint token
            const functionData_lazyMint = dropERC721Impl.interface.encodeFunctionData("lazyMint", [
                5,
                "baseURI",
                ethers.utils.formatBytes32String("")
            ])
            await contractAdmin.sendTransaction({
                to: dropERC721.address,
                data: functionData_lazyMint
            })
        })

        it("Should let claimer claim up to quantityLimitPerTransaction", async () => {
            const quantityToClaim = claimConditions[0].quantityLimitPerTransaction;

            const functionData_claim = dropERC721Impl.interface.encodeFunctionData("claim", [
                claimer.address,
                quantityToClaim,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
                0,
                [hexZeroPad([0], 32)],
                0
            ])
            await expect(claimer.sendTransaction({
                to: dropERC721.address,
                data: functionData_claim
            })).to.not.be.reverted;
        })

        it("Should let any address claim tokens", async () => {

            const [,,randomSigner] = await ethers.getSigners();

            const quantityToClaim = claimConditions[0].quantityLimitPerTransaction;

            const functionData_claim = dropERC721Impl.interface.encodeFunctionData("claim", [
                randomSigner.address,
                quantityToClaim,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
                0,
                [hexZeroPad([0], 32)],
                0
            ])
            await expect(randomSigner.sendTransaction({
                to: dropERC721.address,
                data: functionData_claim
            })).to.not.be.reverted;
        })
    })

    describe("Allowlist, but no quantity restriction for the claimer on allowlist", function() {

        let tree: MerkleTree;

        beforeEach(async () => {
            const quantityRestrictionOnAllowlist = 0;
            const quantityLimitPerTransaction = 5

            // Generate allowlist
            const leaves = [claimer.address].map(x => ethers.utils.solidityKeccak256(["address", "uint256"], [x, quantityRestrictionOnAllowlist]));
            tree = new MerkleTree(leaves, ethers.utils.solidityKeccak256);
            const merkleRoot = tree.getRoot();

            // Contract admin sets claim condition.
            claimConditions = [{
                startTimestamp: 0,
                maxClaimableSupply: 5,
                supplyClaimed: 0,
                quantityLimitPerTransaction: quantityLimitPerTransaction,
                waitTimeInSecondsBetweenClaims: ethers.constants.MaxUint256,
                merkleRoot: merkleRoot,
                pricePerToken: 0,
                currency: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
            }]

            // Set claim conditions
            const functionData_setClaimConditions = dropERC721Impl.interface.encodeFunctionData("setClaimConditions", [claimConditions, false]);
            await contractAdmin.sendTransaction({
                to: dropERC721.address,
                data: functionData_setClaimConditions  
            })

            // Lazy mint token
            const functionData_lazyMint = dropERC721Impl.interface.encodeFunctionData("lazyMint", [
                5,
                "baseURI",
                ethers.utils.formatBytes32String("")
            ])
            await contractAdmin.sendTransaction({
                to: dropERC721.address,
                data: functionData_lazyMint
            })
        })

        it("Should let claimer claim up to quantityLimitPerTransaction", async () => {
            const quantityToClaim = claimConditions[0].quantityLimitPerTransaction;
            expect(quantityToClaim).to.equal(5);

            const proof = tree.getHexProof(
                ethers.utils.solidityKeccak256(["address", "uint256"], [claimer.address, quantityToClaim])
            )

            const functionData_claim = dropERC721Impl.interface.encodeFunctionData("claim", [
                claimer.address,
                quantityToClaim,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
                0,
                proof,
                0
            ])
            await expect(claimer.sendTransaction({
                to: dropERC721.address,
                data: functionData_claim
            })).to.not.be.reverted;
        })

        it("Should only let addresses in allowlist to claim tokkens", async () => {
            const [,,randomSigner] = await ethers.getSigners();

            const quantityToClaim = claimConditions[0].quantityLimitPerTransaction;
            const proof = tree.getHexProof(
                ethers.utils.solidityKeccak256(["address", "uint256"], [randomSigner.address, quantityToClaim])
            )

            const functionData_claim = dropERC721Impl.interface.encodeFunctionData("claim", [
                randomSigner.address,
                quantityToClaim,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
                0,
                proof,
                0
            ])
            await expect(randomSigner.sendTransaction({
                to: dropERC721.address,
                data: functionData_claim
            })).to.be.revertedWith("not in whitelist.")
        })
    })

    describe("Allowlist with quantity restriction for the claimer on allowlist", function() {

        let tree: MerkleTree;
        let quantityRestrictionOnAllowlist: number;

        beforeEach(async () => {
            quantityRestrictionOnAllowlist = 2;
            const quantityLimitPerTransaction = 5

            // Generate allowlist
            const leaves = [claimer.address].map(x => ethers.utils.solidityKeccak256(["address", "uint256"], [x, quantityRestrictionOnAllowlist]));
            tree = new MerkleTree(leaves, ethers.utils.solidityKeccak256);
            const merkleRoot = tree.getRoot();

            claimConditions = [{
                startTimestamp: 0,
                maxClaimableSupply: 5,
                supplyClaimed: 0,
                quantityLimitPerTransaction: quantityLimitPerTransaction,
                waitTimeInSecondsBetweenClaims: ethers.constants.MaxUint256,
                merkleRoot: merkleRoot,
                pricePerToken: 0,
                currency: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
            }]

            // Set claim conditions
            const functionData_setClaimConditions = dropERC721Impl.interface.encodeFunctionData("setClaimConditions", [claimConditions, false]);
            await contractAdmin.sendTransaction({
                to: dropERC721.address,
                data: functionData_setClaimConditions  
            })

            // Lazy mint token
            const functionData_lazyMint = dropERC721Impl.interface.encodeFunctionData("lazyMint", [
                5,
                "baseURI",
                ethers.utils.formatBytes32String("")
            ])
            await contractAdmin.sendTransaction({
                to: dropERC721.address,
                data: functionData_lazyMint
            })
        })

        it("Should let claimer claim up to quantityRestrictionOnAllowlist", async () => {
            const invalidQuantityToClaim = claimConditions[0].quantityLimitPerTransaction;
            expect(invalidQuantityToClaim).to.equal(5);

            const quantityToClaim = 2;

            const proof = tree.getHexProof(
                ethers.utils.solidityKeccak256(["address", "uint256"], [claimer.address, quantityToClaim])
            )

            const functionData_claim = dropERC721Impl.interface.encodeFunctionData("claim", [
                claimer.address,
                quantityToClaim,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
                0,
                proof,
                2
            ])

            const functionData_invalidClaim = dropERC721Impl.interface.encodeFunctionData("claim", [
                claimer.address,
                invalidQuantityToClaim,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
                0,
                proof,
                2
            ])

            await expect(claimer.sendTransaction({
                to: dropERC721.address,
                data: functionData_invalidClaim
            })).to.be.revertedWith("invalid quantity proof.");

            await expect(claimer.sendTransaction({
                to: dropERC721.address,
                data: functionData_claim
            })).to.not.be.reverted;
        })

        it("Should only let addresses in allowlist to claim tokkens", async () => {
            const [,,randomSigner] = await ethers.getSigners();

            const invalidQuantityToClaim = claimConditions[0].quantityLimitPerTransaction;
            expect(invalidQuantityToClaim).to.equal(5);

            const quantityToClaim = 2;

            const proof = tree.getHexProof(
                ethers.utils.solidityKeccak256(["address", "uint256"], [randomSigner.address, quantityToClaim])
            )

            const functionData_claim = dropERC721Impl.interface.encodeFunctionData("claim", [
                randomSigner.address,
                quantityToClaim,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
                0,
                proof,
                2
            ])

            await expect(randomSigner.sendTransaction({
                to: dropERC721.address,
                data: functionData_claim
            })).to.be.revertedWith("not in whitelist.");
        })
    })
})