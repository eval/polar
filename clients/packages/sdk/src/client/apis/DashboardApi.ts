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
  HTTPValidationError,
  IssueListResponse,
  IssueListType,
  IssueSortBy,
  IssueStatus,
  Platforms,
  PledgesTypeSummaries,
} from '../models/index';

export interface DashboardApiGetDashboardRequest {
    platform: Platforms;
    orgName: string;
    repoName?: string;
    issueListType?: IssueListType;
    status?: Array<IssueStatus>;
    q?: string;
    sort?: IssueSortBy;
    onlyPledged?: boolean;
    onlyBadged?: boolean;
    page?: number;
}

export interface DashboardApiGetPersonalDashboardRequest {
    issueListType?: IssueListType;
    status?: Array<IssueStatus>;
    q?: string;
    sort?: IssueSortBy;
    onlyPledged?: boolean;
    onlyBadged?: boolean;
    page?: number;
}

/**
 * 
 */
export class DashboardApi extends runtime.BaseAPI {

    /**
     * Dummy Do Not Use
     */
    async dummyDoNotUseRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<PledgesTypeSummaries>> {
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
            path: `/api/v1/dashboard/dummy_do_not_use`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response);
    }

    /**
     * Dummy Do Not Use
     */
    async dummyDoNotUse(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<PledgesTypeSummaries> {
        const response = await this.dummyDoNotUseRaw(initOverrides);
        return await response.value();
    }

    /**
     * Get Dashboard
     */
    async getDashboardRaw(requestParameters: DashboardApiGetDashboardRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<IssueListResponse>> {
        if (requestParameters['platform'] == null) {
            throw new runtime.RequiredError(
                'platform',
                'Required parameter "platform" was null or undefined when calling getDashboard().'
            );
        }

        if (requestParameters['orgName'] == null) {
            throw new runtime.RequiredError(
                'orgName',
                'Required parameter "orgName" was null or undefined when calling getDashboard().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['repoName'] != null) {
            queryParameters['repo_name'] = requestParameters['repoName'];
        }

        if (requestParameters['issueListType'] != null) {
            queryParameters['issue_list_type'] = requestParameters['issueListType'];
        }

        if (requestParameters['status'] != null) {
            queryParameters['status'] = requestParameters['status'];
        }

        if (requestParameters['q'] != null) {
            queryParameters['q'] = requestParameters['q'];
        }

        if (requestParameters['sort'] != null) {
            queryParameters['sort'] = requestParameters['sort'];
        }

        if (requestParameters['onlyPledged'] != null) {
            queryParameters['only_pledged'] = requestParameters['onlyPledged'];
        }

        if (requestParameters['onlyBadged'] != null) {
            queryParameters['only_badged'] = requestParameters['onlyBadged'];
        }

        if (requestParameters['page'] != null) {
            queryParameters['page'] = requestParameters['page'];
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
            path: `/api/v1/dashboard/{platform}/{org_name}`.replace(`{${"platform"}}`, encodeURIComponent(String(requestParameters['platform']))).replace(`{${"org_name"}}`, encodeURIComponent(String(requestParameters['orgName']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response);
    }

    /**
     * Get Dashboard
     */
    async getDashboard(requestParameters: DashboardApiGetDashboardRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<IssueListResponse> {
        const response = await this.getDashboardRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Get Personal Dashboard
     */
    async getPersonalDashboardRaw(requestParameters: DashboardApiGetPersonalDashboardRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<IssueListResponse>> {
        const queryParameters: any = {};

        if (requestParameters['issueListType'] != null) {
            queryParameters['issue_list_type'] = requestParameters['issueListType'];
        }

        if (requestParameters['status'] != null) {
            queryParameters['status'] = requestParameters['status'];
        }

        if (requestParameters['q'] != null) {
            queryParameters['q'] = requestParameters['q'];
        }

        if (requestParameters['sort'] != null) {
            queryParameters['sort'] = requestParameters['sort'];
        }

        if (requestParameters['onlyPledged'] != null) {
            queryParameters['only_pledged'] = requestParameters['onlyPledged'];
        }

        if (requestParameters['onlyBadged'] != null) {
            queryParameters['only_badged'] = requestParameters['onlyBadged'];
        }

        if (requestParameters['page'] != null) {
            queryParameters['page'] = requestParameters['page'];
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
            path: `/api/v1/dashboard/personal`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response);
    }

    /**
     * Get Personal Dashboard
     */
    async getPersonalDashboard(requestParameters: DashboardApiGetPersonalDashboardRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<IssueListResponse> {
        const response = await this.getPersonalDashboardRaw(requestParameters, initOverrides);
        return await response.value();
    }

}
