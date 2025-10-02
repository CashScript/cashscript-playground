export const exampleTimeoutContract = `pragma cashscript ~0.12.0;

// see https://cashscript.org/docs/basics/getting-started#writing-your-first-contract

contract TransferWithTimeout(pubkey sender, pubkey recipient, int timeout) {
    // Require recipient's signature to match
    function transfer(sig recipientSig) {
        require(checkSig(recipientSig, recipient));
    }
    
    // Require timeout time to be reached and sender's signature to match
    function timeout(sig senderSig) {
        require(checkSig(senderSig, sender));
        require(tx.time >= timeout);
    }
}
`

export const exampleEscrowContract = `pragma cashscript ~0.12.0;

// see https://cashscript.org/docs/guides/covenants#restricting-p2pkh-recipients
    
contract Escrow(bytes20 arbiter, bytes20 buyer, bytes20 seller) {
    function spend(pubkey pk, sig s) {
        require(hash160(pk) == arbiter);
        require(checkSig(s, pk));

        // Check that the correct amount is sent
        int minerFee = 1000; // hardcoded fee
        int amount = tx.inputs[this.activeInputIndex].value - minerFee;
        require(tx.outputs[0].value == amount);

        // Check that the transaction sends to either the buyer or the seller
        bytes25 buyerLock = new LockingBytecodeP2PKH(buyer);
        bytes25 sellerLock = new LockingBytecodeP2PKH(seller);
        bool sendsToBuyer = tx.outputs[0].lockingBytecode == buyerLock;
        bool sendsToSeller = tx.outputs[0].lockingBytecode == sellerLock;
        require(sendsToBuyer || sendsToSeller);
    }
}
`

export const exampleStramingMecenasContract = `pragma cashscript ~0.12.0;

// see https://cashscript.org/docs/guides/covenants#keeping-local-state-in-nfts
    
// Mutable NFT Commitment contract state
// bytes8 latestLockTime

contract StreamingMecenas(
    bytes20 recipient,
    bytes20 funder,
    int pledgePerBlock,
) {
    function receive() {
        // Check that the first output sends to the recipient
        bytes25 recipientLockingBytecode = new LockingBytecodeP2PKH(recipient);
        require(tx.outputs[0].lockingBytecode == recipientLockingBytecode);

        // Read the block height of the previous pledge, kept in the NFT commitment
        require(tx.inputs.length == 1);
        bytes localState = tx.inputs[0].nftCommitment;
        int blockHeightPreviousPledge = int(localState);

        // Check that time has passed and that time locks are enabled
        require(tx.time >= blockHeightPreviousPledge);

        // Calculate the amount that has accrued since last claim
        int passedBlocks = tx.locktime - blockHeightPreviousPledge;
        int pledge = passedBlocks * pledgePerBlock;

        // Calculate the leftover amount
        int minerFee = 1000;
        int currentValue = tx.inputs[0].value;
        int changeValue = currentValue - pledge - minerFee;

        // If there is not enough left for *another* pledge after this one,
        // we send the remainder to the recipient. Otherwise we send the
        // remainder to the recipient and the change back to the contract
        if (changeValue <= pledge + minerFee) {
            require(tx.outputs[0].value == currentValue - minerFee);
        } else {
            // Check that the outputs send the correct amounts
            require(tx.outputs[0].value == pledge);
            require(tx.outputs[1].value == changeValue);

            // Send the change value back to the same smart contract locking bytecode
            require(tx.outputs[1].lockingBytecode == tx.inputs[0].lockingBytecode);

            // Update the block height of the previous pledge, kept in the NFT commitment
            bytes blockHeightNewPledge = bytes8(tx.locktime);
            require(tx.outputs[1].nftCommitment == blockHeightNewPledge);
        }
    }

    function reclaim(pubkey pk, sig s) {
        require(hash160(pk) == funder);
        require(checkSig(s, pk));
    }
}
`

export const exampleDexContract = `pragma cashscript ~0.12.0;

// see https://cashscript.org/docs/language/examples#amm-dex

contract DexContract(bytes20 poolOwnerPkh) {
    function swap() {
        // Verify it is the correct token category
        bytes inputToken = tx.inputs[this.activeInputIndex].tokenCategory;
        bytes outputToken = tx.outputs[this.activeInputIndex].tokenCategory;
        require(inputToken == outputToken);

        // Enforce version 2
        // Enforcing version is to make sure that tools that
        // use this contract stay compatible, when and if
        // transaction format changes in the future.
        require(tx.version == 2);

        // Verify that this contract lives on on the output with the same input as this contract.
        bytes inputBytecode = tx.inputs[this.activeInputIndex].lockingBytecode;
        bytes outputBytecode = tx.outputs[this.activeInputIndex].lockingBytecode;
        require(inputBytecode == outputBytecode);

        // Calculate target K
        int targetK = tx.inputs[this.activeInputIndex].value * tx.inputs[this.activeInputIndex].tokenAmount;

        // Calculate fee for trade. Fee is ~0.3%
        int tradeValue = abs(tx.inputs[this.activeInputIndex].value - tx.outputs[this.activeInputIndex].value);
        int fee = (tradeValue * 3) / 1000;

        // Get effective output K when including the fee.
        int effectiveOutputK = (tx.outputs[this.activeInputIndex].value - fee) * tx.outputs[this.activeInputIndex].tokenAmount;

        // Verify that effective K > target K
        require(effectiveOutputK >= targetK);
    }
    function withdrawal(pubkey poolOwnerPk, sig poolOwnerSig) {
        require(hash160(poolOwnerPk) == poolOwnerPkh);
        require(checkSig(poolOwnerSig, poolOwnerPk));
    }
}
`