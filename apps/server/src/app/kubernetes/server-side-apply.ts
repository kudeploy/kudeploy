import {
  PatchStrategy,
  type ConfigurationOptions,
  type ObservableMiddleware,
} from '@kubernetes/client-node';
import type {
  RequestContext,
  ResponseContext,
} from '@kubernetes/client-node/dist/gen/http/http.js';
import { of } from '@kubernetes/client-node/dist/gen/rxjsStub.js';

const serverSideApplyMiddleware: ObservableMiddleware = {
  pre(context: RequestContext) {
    context.setHeaderParam('Content-Type', PatchStrategy.ServerSideApply);
    return of(context);
  },
  post(context: ResponseContext) {
    return of(context);
  },
};

export const SERVER_SIDE_APPLY_OPTIONS: ConfigurationOptions = {
  middleware: [serverSideApplyMiddleware],
};
