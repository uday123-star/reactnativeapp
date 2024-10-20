import {
	ApolloError,
	ApolloLink,
	Observable
} from '@apollo/client';

const connections: { [key: string]: AbortController } = {};

/**
 * This incerceptor is been used for avoiding the same request multiple times.
 * it is currently been used on the Classlist screen, in order to be capable to use this
 * que useQuery/useLazyQuery should specify additional information for the query context:
 * context: {
 * 		requestTrackerId: 'YOUR_QUERY_IDENTIFIER',
 * }
 * The interceptor will abort the previous requests that are using the same identifier (requestTrackerId).
 */
export const cancelLink = new ApolloLink(
	(operation, forward) =>
		new Observable(observer => {
			const context = operation.getContext();
			/** Final touch to cleanup */

			const connectionHandle = forward(operation).subscribe({
				next: (...arg) => observer.next(...arg),
				error: (...arg) => {
					cleanUp();
					observer.error(...arg)
				},
				complete: (...arg) => {
					cleanUp();
					observer.complete(...arg)
				},
			});

			const cleanUp = () => {
				connectionHandle?.unsubscribe();
				delete connections[context.requestTrackerId];
			}

			if (context.requestTrackerId) {
				const controller = new AbortController();
				controller.signal.onabort = () => {
					observer.error(new ApolloError({
						errorMessage: 'Cancelled by user'
					})); // we need to return an error for been able to detect when the request is cancelled
					cleanUp();
				};
				operation.setContext({
					...context,
					fetchOptions: {
						signal: controller.signal,
						...context?.fetchOptions
					},
				});

				if (connections[context.requestTrackerId]) {
					// If a controller exists, that means this operation should be aborted.
					connections[context.requestTrackerId]?.abort();
				}

				connections[context.requestTrackerId] = controller;
			}

			return connectionHandle;
		})
);
