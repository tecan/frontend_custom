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

    const buildDefaultTextPlaceholderSettings = (enabled = true) => ({
      enabled,
      descriptionPlaceholder: "Customize this text to assist your team, consistent with your organisation's processes and terminology. e.g.\n1. What is the vulnerability?\n2. Which component or system is affected?\n3. What behaviour or condition makes this exploitable?",
      detailPlaceholder: "Customize this text to assist your team, consistent with your organisation's processes and terminology. e.g.\n1. List any affected third-party or open-source dependencies.\n2. Note any proof-of-concept or active exploitation evidence.\n3. Indicate if vendor notification or coordinated disclosure is required.",
      recommendationPlaceholder: "Customize this text to assist your team, consistent with your organisation's processes and terminology. e.g.\n1. What patch, update, or fix is available?\n2. Are there compensating controls if a fix is not available?\n3. What is the recommended timeline for remediation?",
      referencesPlaceholder: "Customize this text to assist your team, consistent with your organisation's processes and terminology. e.g.\n1. CVE ID or internal reference (e.g. CVE-2024-1234).\n2. Vendor advisory or official patch link.\n3. CPE identifier or affected version range.",
      riskJustificationPlaceholder: "Customize this text to assist your team, consistent with your organisation's processes and terminology. e.g.\n1. Justify the selected impact level based on affected assets and data sensitivity.\n2. Justify the likelihood level based on exploitability and threat context.\n3. Reference any supporting threat intelligence or prior incidents.",
      residualRiskPlaceholder: "Customize this text to assist your team, consistent with your organisation's processes and terminology. e.g.\n1. Describe the mitigations applied and their effectiveness.\n2. State the remaining exposure and why it is acceptable.\n3. Confirm who has formally approved the residual risk.",
      commentPlaceholder: "Customize this text to assist your team, consistent with your organisation's processes and terminology. e.g.\n1. Summarise the audit decision and key findings.\n2. Note any escalation actions or follow-up tasks required.\n3. Record who reviewed this finding and when.",
      analysisDetailsInstruction: "Customize this text to assist your team, consistent with your organisation's processes and terminology. e.g.\n1. Identify all affected software items and versions.\n2. Describe the security context and environment of discovery.\n3. Note any disclosure obligations or regulatory considerations."
    });

    const buildDisabledTextPlaceholderSettings = () => ({
      enabled: false,
      descriptionPlaceholder: '',
      detailPlaceholder: '',
      recommendationPlaceholder: '',
      referencesPlaceholder: '',
      riskJustificationPlaceholder: '',
      residualRiskPlaceholder: '',
      commentPlaceholder: '',
      analysisDetailsInstruction: '',
    });

    const buildEffectiveTextPlaceholderSettings = (settings = {}) => {
      if (settings.enabled === false) {
        return buildDisabledTextPlaceholderSettings();
      }
      return {
        ...buildDefaultTextPlaceholderSettings(true),
        ...settings,
        enabled: true,
      };
    };

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
          orgCode: 'Org_Name',
          projectCode: 'Project Name',
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
        return buildDefaultTextPlaceholderSettings();
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
              orgCode: 'Org_Name',
              projectCode: 'Project Name',
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
              cachedTextPlaceholderSettings = buildEffectiveTextPlaceholderSettings(response.data);
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
          cachedTextPlaceholderSettings = buildEffectiveTextPlaceholderSettings(settings);
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
