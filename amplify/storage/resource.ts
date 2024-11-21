import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'photos',
  access: (allow) => ({
    'protected/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete'])
    ]
  })
})