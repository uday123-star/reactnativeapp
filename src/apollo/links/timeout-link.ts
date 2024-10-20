import ApolloLinkTimeout from 'apollo-link-timeout';

export const timeoutLink = new ApolloLinkTimeout(30000);
