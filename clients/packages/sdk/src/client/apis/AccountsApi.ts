/* tslint:disable */
/* eslint-disable */
/**
 * Polar API
 *  Welcome to the **Polar API** for [polar.sh](https://polar.sh).  This specification contains both the definitions of the Polar HTTP API and the Webhook API.  #### Authentication  Use a [Personal Access Token](https://polar.sh/settings) and send it in the `Authorization` header on the format `Bearer [YOUR_TOKEN]`.  #### Feedback  If you have any feedback or comments, reach out in the [Polar API-issue](https://github.com/polarsource/polar/issues/834), or reach out on the Polar Discord server.  We\'d love to see what you\'ve built with the API and to get your thoughts on how we can make the API better!  #### Connecting  The Polar API is online at `https://api.polar.sh`. 
 *
 * The version of the OpenAPI document: 0.1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import * as runtime from '../runtime';
import type {
  Account,
  AccountCreate,
  AccountLink,
  HTTPValidationError,
  ListResourceAccount,
} from '../models/index';

export interface AccountsApiCreateRequest {
    accountCreate: AccountCreate;
}

export interface AccountsApiDashboardLinkRequest {
    id: string;
}

export interface AccountsApiGetRequest {
    id: string;
}

export interface AccountsApiOnboardingLinkRequest {
    id: string;
    returnPath: string;
}

export interface AccountsApiSearchRequest {
    page?: number;
    limit?: number;
}

/**
 * 
 */
export class AccountsApi extends runtime.BaseAPI {

    /**
     * Create
     */
    async createRaw(requestParameters: AccountsApiCreateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Account>> {
        if (requestParameters['accountCreate'] == null) {
            throw new runtime.RequiredError(
                'accountCreate',
                'Required parameter "accountCreate" was null or undefined when calling create().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("HTTPBearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/v1/accounts`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: requestParameters['accountCreate'],
        }, initOverrides);

        return new runtime.JSONApiResponse(response);
    }

    /**
     * Create
     */
    async create(requestParameters: AccountsApiCreateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Account> {
        const response = await this.createRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Dashboard Link
     */
    async dashboardLinkRaw(requestParameters: AccountsApiDashboardLinkRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<AccountLink>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling dashboardLink().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("HTTPBearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/v1/accounts/{id}/dashboard_link`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response);
    }

    /**
     * Dashboard Link
     */
    async dashboardLink(requestParameters: AccountsApiDashboardLinkRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<AccountLink> {
        const response = await this.dashboardLinkRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Get
     */
    async getRaw(requestParameters: AccountsApiGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Account>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling get().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("HTTPBearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/v1/accounts/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response);
    }

    /**
     * Get
     */
    async get(requestParameters: AccountsApiGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Account> {
        const response = await this.getRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Onboarding Link
     */
    async onboardingLinkRaw(requestParameters: AccountsApiOnboardingLinkRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<AccountLink>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling onboardingLink().'
            );
        }

        if (requestParameters['returnPath'] == null) {
            throw new runtime.RequiredError(
                'returnPath',
                'Required parameter "returnPath" was null or undefined when calling onboardingLink().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['returnPath'] != null) {
            queryParameters['return_path'] = requestParameters['returnPath'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("HTTPBearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/v1/accounts/{id}/onboarding_link`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response);
    }

    /**
     * Onboarding Link
     */
    async onboardingLink(requestParameters: AccountsApiOnboardingLinkRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<AccountLink> {
        const response = await this.onboardingLinkRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Search
     */
    async searchRaw(requestParameters: AccountsApiSearchRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ListResourceAccount>> {
        const queryParameters: any = {};

        if (requestParameters['page'] != null) {
            queryParameters['page'] = requestParameters['page'];
        }

        if (requestParameters['limit'] != null) {
            queryParameters['limit'] = requestParameters['limit'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("HTTPBearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/v1/accounts/search`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response);
    }

    /**
     * Search
     */
    async search(requestParameters: AccountsApiSearchRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ListResourceAccount> {
        const response = await this.searchRaw(requestParameters, initOverrides);
        return await response.value();
    }

}
