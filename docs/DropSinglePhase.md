# DropSinglePhase









## Methods

### claim

```solidity
function claim(address _receiver, uint256 _quantity, address _currency, uint256 _pricePerToken, IDropSinglePhase.AllowlistProof _allowlistProof, bytes _data) external payable
```



*Lets an account claim tokens.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _receiver | address | undefined
| _quantity | uint256 | undefined
| _currency | address | undefined
| _pricePerToken | uint256 | undefined
| _allowlistProof | IDropSinglePhase.AllowlistProof | undefined
| _data | bytes | undefined

### claimCondition

```solidity
function claimCondition() external view returns (uint256 startTimestamp, uint256 maxClaimableSupply, uint256 supplyClaimed, uint256 quantityLimitPerTransaction, uint256 waitTimeInSecondsBetweenClaims, bytes32 merkleRoot, uint256 pricePerToken, address currency)
```



*The active conditions for claiming tokens.*


#### Returns

| Name | Type | Description |
|---|---|---|
| startTimestamp | uint256 | undefined
| maxClaimableSupply | uint256 | undefined
| supplyClaimed | uint256 | undefined
| quantityLimitPerTransaction | uint256 | undefined
| waitTimeInSecondsBetweenClaims | uint256 | undefined
| merkleRoot | bytes32 | undefined
| pricePerToken | uint256 | undefined
| currency | address | undefined

### getClaimTimestamp

```solidity
function getClaimTimestamp(address _claimer) external view returns (uint256 lastClaimedAt, uint256 nextValidClaimTimestamp)
```



*Returns the timestamp for when a claimer is eligible for claiming NFTs again.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _claimer | address | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| lastClaimedAt | uint256 | undefined
| nextValidClaimTimestamp | uint256 | undefined

### setClaimConditions

```solidity
function setClaimConditions(IClaimCondition.ClaimCondition _condition, bool _resetClaimEligibility) external nonpayable
```



*Lets a contract admin set claim conditions.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _condition | IClaimCondition.ClaimCondition | undefined
| _resetClaimEligibility | bool | undefined

### verifyClaim

```solidity
function verifyClaim(address _claimer, uint256 _quantity, address _currency, uint256 _pricePerToken, bool verifyMaxQuantityPerTransaction) external view
```



*Checks a request to claim NFTs against the active claim condition&#39;s criteria.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _claimer | address | undefined
| _quantity | uint256 | undefined
| _currency | address | undefined
| _pricePerToken | uint256 | undefined
| verifyMaxQuantityPerTransaction | bool | undefined

### verifyClaimMerkleProof

```solidity
function verifyClaimMerkleProof(address _claimer, uint256 _quantity, IDropSinglePhase.AllowlistProof _allowlistProof) external view returns (bool validMerkleProof, uint256 merkleProofIndex)
```



*Checks whether a claimer meets the claim condition&#39;s allowlist criteria.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _claimer | address | undefined
| _quantity | uint256 | undefined
| _allowlistProof | IDropSinglePhase.AllowlistProof | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| validMerkleProof | bool | undefined
| merkleProofIndex | uint256 | undefined



## Events

### ClaimConditionUpdated

```solidity
event ClaimConditionUpdated(IClaimCondition.ClaimCondition condition, bool resetEligibility)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| condition  | IClaimCondition.ClaimCondition | undefined |
| resetEligibility  | bool | undefined |

### TokensClaimed

```solidity
event TokensClaimed(address indexed claimer, address indexed receiver, uint256 startTokenId, uint256 quantityClaimed)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| claimer `indexed` | address | undefined |
| receiver `indexed` | address | undefined |
| startTokenId  | uint256 | undefined |
| quantityClaimed  | uint256 | undefined |



