/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/add-expense`; params?: Router.UnknownInputParams; } | { pathname: `/debug`; params?: Router.UnknownInputParams; } | { pathname: `/edit-expense`; params?: Router.UnknownInputParams; } | { pathname: `/expenses`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/login`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/add-expense`; params?: Router.UnknownOutputParams; } | { pathname: `/debug`; params?: Router.UnknownOutputParams; } | { pathname: `/edit-expense`; params?: Router.UnknownOutputParams; } | { pathname: `/expenses`; params?: Router.UnknownOutputParams; } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/login`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/add-expense${`?${string}` | `#${string}` | ''}` | `/debug${`?${string}` | `#${string}` | ''}` | `/edit-expense${`?${string}` | `#${string}` | ''}` | `/expenses${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | `/login${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/add-expense`; params?: Router.UnknownInputParams; } | { pathname: `/debug`; params?: Router.UnknownInputParams; } | { pathname: `/edit-expense`; params?: Router.UnknownInputParams; } | { pathname: `/expenses`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/login`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; };
    }
  }
}
