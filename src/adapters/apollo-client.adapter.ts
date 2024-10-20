import { ApolloClient, InMemoryCache, NormalizedCacheObject, makeVar } from '@apollo/client';
import links from '../apollo/links';

export const BlockedStudents = makeVar<string[]>([]);
export const shouldRefreshNewMembersModule = makeVar(false);

const GLOBAL = global as typeof globalThis & {
  apolloClient: ApolloClient<NormalizedCacheObject>
}

GLOBAL.apolloClient = new ApolloClient({
  link: links,
  cache: new InMemoryCache({
    resultCaching: false,
    typePolicies: {
      // Fix for multiple verbose warnings whenever UserAvater is used.
      // ( Display type missing id warning )
      Display: {
        keyFields: ['url']
      },
      Visit: {
        keyFields: ['visiteeId']
      },
      School: {
        keyFields: ['id', 'year']
      },
      Student: {
        keyFields: ['personId'],
        fields: {
          isBlocked: {
            read: (value, { readField }) => {
              return BlockedStudents().includes(readField('personId') || '')
            }
          }
        }
      },
      // Removes a warning about the cache: https://cmates.atlassian.net/browse/MAT-883
      IruWord: {
        fields: {
          iruTags: {
            merge(existing, incoming) {
              return incoming
            }
          }
        }
      },
      Conversation: {
        fields: {
          comments: {
            merge(existing, incoming) {
              return incoming
            }
          },
          highlighted: {
            read(highlighted = false) {
              return highlighted
            }
          }
        }
      },
      FeaturedCarousel: {
        fields: {
          items: {
            merge(existing, incoming) {
              return incoming
            }
          }
        }
      },
      Query: {
        fields: {
          conversationsFeed: {
            keyArgs: ['schoolId', 'yearRange'], // This two fields are been used for caching the query responses
            merge(existing = [], incoming, { variables }) {
              if (variables?.lastId) {
                return [...existing, ...incoming];
              }
              return incoming;
            },
          },
          searchStudents: {
            merge: false
          },
          conversationsSiteNotifications: {
            merge: false
          }
        }
      }
    }
  }),
  defaultOptions: {
    mutate: { errorPolicy: 'all' }
  },
});

export default GLOBAL.apolloClient;
