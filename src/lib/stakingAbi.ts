// ZetaChain Staking Precompile ABI
// Contract address: 0x0000000000000000000000000000000000000800

export const STAKING_PRECOMPILE_ADDRESS = '0x0000000000000000000000000000000000000800' as const;

// Target validator for anuma.ai staking
export const VALIDATOR_ADDRESS = 'zetavaloper1k6vh9y7ctn06pu5jngznv5dyy0rltl2q902dz7';

export const stakingAbi = [
  // delegate - Stake tokens to a validator
  {
    name: 'delegate',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'delegatorAddress', type: 'address' },
      { name: 'validatorAddress', type: 'string' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: 'success', type: 'bool' }],
  },
  // undelegate - Unstake tokens from a validator
  {
    name: 'undelegate',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'delegatorAddress', type: 'address' },
      { name: 'validatorAddress', type: 'string' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: 'completionTime', type: 'int64' }],
  },
  // delegation - Query current delegation
  {
    name: 'delegation',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'delegatorAddress', type: 'address' },
      { name: 'validatorAddress', type: 'string' },
    ],
    outputs: [
      { name: 'shares', type: 'uint256' },
      {
        name: 'balance',
        type: 'tuple',
        components: [
          { name: 'denom', type: 'string' },
          { name: 'amount', type: 'uint256' },
        ],
      },
    ],
  },
  // unbondingDelegation - Query unbonding delegations
  {
    name: 'unbondingDelegation',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'delegatorAddress', type: 'address' },
      { name: 'validatorAddress', type: 'string' },
    ],
    outputs: [
      {
        name: 'unbondingDelegation',
        type: 'tuple',
        components: [
          { name: 'delegatorAddress', type: 'string' },
          { name: 'validatorAddress', type: 'string' },
          {
            name: 'entries',
            type: 'tuple[]',
            components: [
              { name: 'creationHeight', type: 'int64' },
              { name: 'completionTime', type: 'int64' },
              { name: 'initialBalance', type: 'uint256' },
              { name: 'balance', type: 'uint256' },
              { name: 'unbondingId', type: 'uint64' },
              { name: 'unbondingOnHoldRefCount', type: 'int64' },
            ],
          },
        ],
      },
    ],
  },
] as const;
