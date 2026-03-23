/**
 * This file is part of Dependency-Track.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 * Copyright (c) OWASP Foundation. All Rights Reserved.
 */

import Vue from 'vue';
import axios from 'axios';

/**
 * Plugin for Customization API endpoints.
 * Provides methods for interacting with customization settings including vulnerability IDs.
 * Includes caching for instant access to vulnerability ID settings.
 */
export default {
  install(vueApp) {
    // Cache for vulnerability ID settings - loaded once, used everywhere
    let cachedVulnIdSettings = null;
    let settingsLoaded = false;
    let loadingPromise = null;
    let cachedTextPlaceholderSettings = null;
    let textSettingsLoaded = false;
    let textLoadingPromise = null;
    // Cache for risk matrix config - loaded once at startup, used by audit form
    let cachedRiskMatrixConfig = null;
    let riskMatrixLoaded = false;
    let riskMatrixLoadingPromise = null;
    // Cache for vulnerability source options - loaded once at startup
    let cachedVulnSourceConfig = null;
    let vulnSourceLoaded = false;
    let vulnSourceLoadingPromise = null;

    const buildDisabledRiskMatrixState = (config = {}) => ({
      ...config,
      enabled: config.enabled === true,
      loadState: 'disabled_by_config',
      loadError: null,
    });

    const buildLoadedRiskMatrixState = (config = {}) => ({
      ...config,
      enabled: true,
      loadState: 'loaded',
      loadError: null,
    });

    const buildFailedRiskMatrixState = (error) => ({
      enabled: false,
      loadState: 'load_failed',
      loadError: {
        status: error?.response?.status || null,
        message: error?.message || null,
      },
    });

    const buildDisabledRiskMatrixState = (config = {}) => ({
      ...config,
      enabled: config.enabled === true,
      loadState: 'disabled_by_config',
      loadError: null,
    });

    const buildLoadedRiskMatrixState = (config = {}) => ({
      ...config,
      enabled: true,
      loadState: 'loaded',
      loadError: null,
    });

    const buildFailedRiskMatrixState = (error) => ({
      enabled: false,
      loadState: 'load_failed',
      loadError: {
        status: error?.response?.status || null,
        message: error?.message || null,
      },
    });

    // Initialize customization API service
    const customizationService = {
      /**
       * Get cached vulnerability ID settings (instant access)
       * Returns cached settings or defaults if not yet loaded.
       * @returns {Object} Cached settings object
       */
      getCachedVulnIdSettings() {
        if (cachedVulnIdSettings) {
          return cachedVulnIdSettings;
        }
        // Return defaults if not loaded yet
        return {
          orgCode: 'DT',
          projectCode: 'project',
          template: '{ORG_CODE}-{PROJECT_NAME}-{YYYY}-{SEQUENCE}',
          resetPolicy: 'YEARLY',
          sequencePadding: 5
        };
      },

      /**
       * Get cached text placeholder settings (instant access)
       * Returns cached settings or defaults if not yet loaded.
       * @returns {Object} Cached text placeholder settings
       */
      getCachedTextPlaceholderSettings() {
        if (cachedTextPlaceholderSettings) {
          return cachedTextPlaceholderSettings;
        }
        return {
          descriptionPlaceholder: '<Add detail description about the vulnerability>',
          detailPlaceholder: '<Add additional details>',
          recommendationPlaceholder: '<Add any recommendation from external companies / partners or internal security team>',
          referencesPlaceholder: '<Add any references if available, example: CPE / CVE references>',
          riskJustificationPlaceholder: 'Explain why this risk is acceptable...',
          residualRiskPlaceholder: 'Describe any remaining risk after mitigation...',
          commentPlaceholder: '<Add all participants for the review/assessment>',
          analysisDetailsInstruction: '1.  Affected Software Items: Identify which software items are impacted. Assess whether third-party code within supported software is affected. If third-party or open source components are involved, determine in the next step whether the issue should be disclosed to the vendor or published on the appropriate platform.\n2.  Security Context: What is the security context in which the vulnerability was discovered? Consider the intended environment of use and any defense-in-depth strategies in place.\n3.  Risk Assessment: Perform a security risk assessment in accordance with the scoring defined in the SOP Product Security Risk Management.\n4.  Root Cause Analysis: What is the root cause of vulnerability? Is it consistent across different products or does it vary?\n5.  Threat Model Coverage: Is the vulnerability addressed by existing threat models?\n6.  Related Security Issues: Is there other related security issues present in the same product?\n7.  Product Safety Impact: Does vulnerability impact product safety? If yes, review and update the safety risk assessment as necessary.\n8.  Only for vulnerability with risk critical and high: define the Customer Communication strategy (PM with input from RA)'
        };
      },

      /**
       * Check if settings have been loaded
       * @returns {boolean} True if settings are loaded
       */
      isSettingsLoaded() {
        return settingsLoaded;
      },

      /**
       * Check if text placeholder settings have been loaded
       * @returns {boolean} True if text placeholder settings are loaded
       */
      isTextPlaceholderSettingsLoaded() {
        return textSettingsLoaded;
      },

      /**
       * Preload vulnerability ID settings (call at app startup)
       * Fetches settings from API and caches them for instant access.
       * @returns {Promise} Resolves when settings are loaded
       */
      async preloadVulnIdSettings() {
        if (settingsLoaded) {
          return cachedVulnIdSettings;
        }
        if (loadingPromise) {
          return loadingPromise;
        }
        loadingPromise = this.getVulnerabilityIdSettings()
          .then((response) => {
            if (response && response.data) {
              cachedVulnIdSettings = response.data;
              settingsLoaded = true;
            }
            return cachedVulnIdSettings;
          })
          .catch((error) => {
            console.warn('Failed to preload vulnerability ID settings, using defaults:', error);
            cachedVulnIdSettings = {
              orgCode: 'DT',
              projectCode: 'project',
              template: '{ORG_CODE}-{PROJECT_NAME}-{YYYY}-{SEQUENCE}',
              resetPolicy: 'YEARLY',
              sequencePadding: 5
            };
            settingsLoaded = true;
            return cachedVulnIdSettings;
          })
          .finally(() => {
            loadingPromise = null;
          });
        return loadingPromise;
      },

      /**
       * Preload text placeholder settings (call at app startup if desired)
       * @returns {Promise} Resolves when text placeholder settings are loaded
       */
      async preloadTextPlaceholderSettings() {
        if (textSettingsLoaded) {
          return cachedTextPlaceholderSettings;
        }
        if (textLoadingPromise) {
          return textLoadingPromise;
        }
        textLoadingPromise = this.getTextPlaceholderSettings()
          .then((response) => {
            if (response && response.data) {
              cachedTextPlaceholderSettings = response.data;
              textSettingsLoaded = true;
            }
            return cachedTextPlaceholderSettings;
          })
          .catch((error) => {
            console.warn('Failed to preload text placeholder settings, using defaults:', error);
            cachedTextPlaceholderSettings = this.getCachedTextPlaceholderSettings();
            textSettingsLoaded = true;
            return cachedTextPlaceholderSettings;
          })
          .finally(() => {
            textLoadingPromise = null;
          });
        return textLoadingPromise;
      },

      /**
       * Preload all customization settings after authentication succeeds.
       * Uses allSettled so one failing endpoint does not block the rest.
       * @returns {Promise<void>}
       */
      async preloadAll() {
        await Promise.allSettled([
          this.preloadVulnIdSettings(),
          this.preloadTextPlaceholderSettings(),
          this.preloadRiskMatrixConfig(),
          this.preloadVulnSourceConfig(),
        ]);
      },

      /**
       * Invalidate cache (call when admin updates settings)
       */
      invalidateCache() {
        cachedVulnIdSettings = null;
        settingsLoaded = false;
      },

      /**
       * Invalidate text placeholder cache (call when admin updates settings)
       */
      invalidateTextPlaceholderCache() {
        cachedTextPlaceholderSettings = null;
        textSettingsLoaded = false;
      },

      /**
       * Get vulnerability ID configuration settings
       * @returns {Promise} Response containing orgCode, template, resetPolicy, sequencePadding
       */
      getVulnerabilityIdSettings() {
        const token = sessionStorage.getItem('token');
        return axios.get(vueApp.prototype.$api.BASE_URL + '/' + vueApp.prototype.$api.URL_CUSTOMIZATION + '/vulnerability-id',
          {
            withCredentials: vueApp.prototype.$api.WITH_CREDENTIALS,
            headers: {
              'Content-Type': vueApp.prototype.$api.CONTENT_TYPE_JSON,
              ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
            },
          }
        );
      },

      /**
       * Update vulnerability ID configuration settings
       * @param {Object} settings - Configuration object with orgCode, template, resetPolicy, sequencePadding
       * @returns {Promise} Response from update operation
       */
      updateVulnerabilityIdSettings(settings) {
        // Invalidate cache when settings are updated
        this.invalidateCache();
        return axios.put(
          vueApp.prototype.$api.BASE_URL + '/' + vueApp.prototype.$api.URL_CUSTOMIZATION + '/vulnerability-id',
          settings,
          {
            withCredentials: vueApp.prototype.$api.WITH_CREDENTIALS,
            headers: { 'Content-Type': vueApp.prototype.$api.CONTENT_TYPE_JSON },
          }
        ).then((response) => {
          // Update cache with new settings
          cachedVulnIdSettings = settings;
          settingsLoaded = true;
          return response;
        });
      },

      /**
       * Get text placeholder configuration settings
       * @returns {Promise} Response containing placeholder texts for create/audit forms
       */
      getTextPlaceholderSettings() {
        return axios.get(vueApp.prototype.$api.BASE_URL + '/' + vueApp.prototype.$api.URL_CUSTOMIZATION + '/text-placeholders',
          {
            withCredentials: vueApp.prototype.$api.WITH_CREDENTIALS,
            headers: { 'Content-Type': vueApp.prototype.$api.CONTENT_TYPE_JSON },
          }
        );
      },

      /**
       * Update text placeholder configuration settings
       * @param {Object} settings - Configuration object containing placeholder texts
       * @returns {Promise} Response from update operation
       */
      updateTextPlaceholderSettings(settings) {
        this.invalidateTextPlaceholderCache();
        return axios.put(
          vueApp.prototype.$api.BASE_URL + '/' + vueApp.prototype.$api.URL_CUSTOMIZATION + '/text-placeholders',
          settings,
          {
            withCredentials: vueApp.prototype.$api.WITH_CREDENTIALS,
            headers: { 'Content-Type': vueApp.prototype.$api.CONTENT_TYPE_JSON },
          }
        ).then((response) => {
          cachedTextPlaceholderSettings = settings;
          textSettingsLoaded = true;
          return response;
        });
      },

      /**
       * Get cached risk matrix config (instant access)
       * Returns cached config or { enabled: false } if not yet loaded.
       * @returns {Object} Cached risk matrix configuration
       */
      getCachedRiskMatrixConfig() {
        return cachedRiskMatrixConfig || buildDisabledRiskMatrixState();
      },

      /**
       * Preload risk matrix config (call at app startup)
       * Fetches config from API and caches it for instant access by the audit form.
       * @returns {Promise} Resolves when config is loaded
       */
      async preloadRiskMatrixConfig() {
        if (riskMatrixLoaded) return cachedRiskMatrixConfig;
        if (riskMatrixLoadingPromise) return riskMatrixLoadingPromise;
        riskMatrixLoadingPromise = this.getRiskMatrixSettings()
          .then((response) => {
            if (response && response.data && response.data.enabled !== undefined) {
              cachedRiskMatrixConfig = response.data.enabled === true
                ? buildLoadedRiskMatrixState(response.data)
                : buildDisabledRiskMatrixState(response.data);
            } else {
              cachedRiskMatrixConfig = buildDisabledRiskMatrixState();
            }
            riskMatrixLoaded = true;
            return cachedRiskMatrixConfig;
          })
          .catch((error) => {
            cachedRiskMatrixConfig = buildFailedRiskMatrixState(error);
            riskMatrixLoaded = false; // don't permanently cache failures — allow retry after login
            return cachedRiskMatrixConfig;
          })
          .finally(() => {
            riskMatrixLoadingPromise = null;
          });
        return riskMatrixLoadingPromise;
      },

      /**
       * Invalidate risk matrix cache (call when admin saves new config)
       */
      invalidateRiskMatrixCache() {
        cachedRiskMatrixConfig = null;
        riskMatrixLoaded = false;
        riskMatrixLoadingPromise = null;
      },

      /**
       * Get risk matrix configuration settings
       * @returns {Promise} Response containing risk matrix model
       */
      async getRiskMatrixSettings() {
        const token = sessionStorage.getItem('token');
        const options = {
          withCredentials: vueApp.prototype.$api.WITH_CREDENTIALS,
          headers: {
            'Content-Type': vueApp.prototype.$api.CONTENT_TYPE_JSON,
            ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
          },
        };
        const baseUrl = vueApp.prototype.$api.BASE_URL + '/' + vueApp.prototype.$api.URL_CUSTOMIZATION + '/risk-matrix';
        try {
          return await axios.get(baseUrl, options);
        } catch (error) {
          if (error?.response?.status === 404) {
            return axios.get(baseUrl + '/draft', options);
          }
          throw error;
        }
      },

      /**
       * Update risk matrix configuration settings
       * @param {Object} settings - Risk matrix configuration
       * @returns {Promise} Response from update operation
       */
      async updateRiskMatrixSettings(settings) {
        const options = {
          withCredentials: vueApp.prototype.$api.WITH_CREDENTIALS,
          headers: { 'Content-Type': vueApp.prototype.$api.CONTENT_TYPE_JSON },
        };
        const baseUrl = vueApp.prototype.$api.BASE_URL + '/' + vueApp.prototype.$api.URL_CUSTOMIZATION + '/risk-matrix';
        try {
          const response = await axios.put(baseUrl, settings, options);
          this.invalidateRiskMatrixCache();
          return response;
        } catch (error) {
          if (error?.response?.status === 404) {
            const response = await axios.put(baseUrl + '/draft', settings, options);
            this.invalidateRiskMatrixCache();
            return response;
          }
          throw error;
        }
      },

      /**
       * Get cached vulnerability source options (instant access)
       * @returns {Object} Cached config with enabled flag and sources array
       */
      getCachedVulnSourceConfig() {
        if (cachedVulnSourceConfig) {
          return cachedVulnSourceConfig;
        }
        return {
          enabled: true,
          values: [
            { key: 'customer', label: 'Customer' },
            { key: 'pen-test', label: 'Pen-Test' },
            { key: 'sonarqube', label: 'SonarQube' },
            { key: 'internal-research', label: 'Internal Research' },
            { key: 'vendor-advisory', label: 'Vendor Advisory' },
            { key: 'other', label: 'Other' },
          ],
        };
      },

      /**
       * Preload vulnerability source config (call at app startup)
       * @returns {Promise} Resolves when config is loaded
       */
      async preloadVulnSourceConfig() {
        if (vulnSourceLoaded) return cachedVulnSourceConfig;
        if (vulnSourceLoadingPromise) return vulnSourceLoadingPromise;
        vulnSourceLoadingPromise = this.getVulnSourceSettings()
          .then((response) => {
            if (response && response.data) {
              cachedVulnSourceConfig = response.data;
              vulnSourceLoaded = true;
            }
            return cachedVulnSourceConfig;
          })
          .catch((error) => {
            console.warn('Failed to preload vulnerability source config, using defaults:', error);
            cachedVulnSourceConfig = this.getCachedVulnSourceConfig();
            vulnSourceLoaded = true;
            return cachedVulnSourceConfig;
          })
          .finally(() => {
            vulnSourceLoadingPromise = null;
          });
        return vulnSourceLoadingPromise;
      },

      /**
       * Invalidate vulnerability source cache
       */
      invalidateVulnSourceCache() {
        cachedVulnSourceConfig = null;
        vulnSourceLoaded = false;
        vulnSourceLoadingPromise = null;
      },

      /**
       * Get vulnerability source configuration
       * @returns {Promise} Response containing enabled flag and sources array
       */
      getVulnSourceSettings() {
        const token = sessionStorage.getItem('token');
        return axios.get(
          vueApp.prototype.$api.BASE_URL + '/' + vueApp.prototype.$api.URL_CUSTOMIZATION + '/vulnerability-source',
          {
            withCredentials: vueApp.prototype.$api.WITH_CREDENTIALS,
            headers: {
              'Content-Type': vueApp.prototype.$api.CONTENT_TYPE_JSON,
              ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
            },
          }
        );
      },

      /**
       * Update vulnerability source configuration
       * @param {Object} settings - Config with enabled flag and sources array
       * @returns {Promise} Response from update operation
       */
      updateVulnSourceSettings(settings) {
        this.invalidateVulnSourceCache();
        return axios.put(
          vueApp.prototype.$api.BASE_URL + '/' + vueApp.prototype.$api.URL_CUSTOMIZATION + '/vulnerability-source',
          settings,
          {
            withCredentials: vueApp.prototype.$api.WITH_CREDENTIALS,
            headers: { 'Content-Type': vueApp.prototype.$api.CONTENT_TYPE_JSON },
          }
        ).then((response) => {
          cachedVulnSourceConfig = settings;
          vulnSourceLoaded = true;
          return response;
        });
      },
    };

    // Register customization service as Vue plugin property
    vueApp.prototype.$customization = customizationService;
  },
};
