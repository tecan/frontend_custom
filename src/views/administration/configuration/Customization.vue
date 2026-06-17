<template>
  <div>
    <b-tabs v-model="activeTab" content-class="mt-3" @input="onTabChange">
      <!-- Vulnerability IDs Tab -->
      <b-tab :title="$t('admin.vulnerability_ids')">
        <b-card no-body class="mb-4">
        <b-card-body>
          <h5 class="mb-3">
            {{ $t('admin.vulnerability_id_generation') }}
          </h5>

          <b-form-group class="mb-4">
            <c-switch
              color="primary"
              v-model="vulnIdConfig.useCustomId"
              label
              v-bind="labelIcon"
            />{{ $t('admin.use_custom_id_generator') }}
            <b-form-text class="mt-1">
              {{ vulnIdConfig.useCustomId ? $t('admin.use_custom_id_generator_on_help') : $t('admin.use_custom_id_generator_off_help') }}
            </b-form-text>
          </b-form-group>

          <b-collapse :visible="vulnIdConfig.useCustomId">
          <b-row>
            <b-col md="6">
              <b-form-group :label="$t('admin.organization_code')">
                <b-form-input
                  v-model="vulnIdConfig.orgCode"
                  placeholder="e.g. OWASP"
                  maxlength="50"
                />
              </b-form-group>
            </b-col>
            <b-col md="6">
              <b-form-group :label="$t('admin.project_code')">
                <b-form-input
                  v-model="vulnIdConfig.projectCode"
                  placeholder="e.g. My Project Name"
                  maxlength="50"
                />
              </b-form-group>
            </b-col>
          </b-row>

          <b-row>
            <b-col md="6">
              <b-form-group :label="$t('admin.vulnerability_id_template')">
                <b-form-input
                  v-model="vulnIdConfig.template"
                  :placeholder="$t('admin.vulnerability_id_template_placeholder')"
                />
                <div class="mt-2">
                  <b-badge
                    v-for="placeholder in availablePlaceholders"
                    :key="placeholder"
                    variant="outline-secondary"
                    class="mr-1 cursor-pointer"
                    @click="insertPlaceholder(placeholder)"
                    style="cursor: pointer"
                  >
                    {{ placeholder }}
                  </b-badge>
                </div>
              </b-form-group>
            </b-col>
            <b-col md="6">
              <b-form-group :label="$t('admin.sequence_reset_policy')">
                <b-form-select v-model="vulnIdConfig.resetPolicy" :options="resetPolicyOptions" />
                <b-form-text>{{ $t('admin.sequence_reset_policy_help') }}</b-form-text>
              </b-form-group>
            </b-col>
          </b-row>

          <b-row>
            <b-col md="6">
              <b-form-group :label="$t('admin.sequence_padding')">
                <b-form-input
                  v-model.number="vulnIdConfig.sequencePadding"
                  type="number"
                  min="1"
                  max="10"
                />
                <b-form-text>{{ $t('admin.sequence_padding_help') }}</b-form-text>
              </b-form-group>
            </b-col>
          </b-row>

          </b-collapse>

          <!-- Preview -->
          <div class="preview-box mt-4 p-3 rounded">
            <div class="d-flex align-items-center">
              <div class="preview-icon mr-3">
                <span class="fa-stack fa-lg">
                  <i class="fa fa-circle fa-stack-2x text-primary"></i>
                  <i class="fa fa-id-badge fa-stack-1x fa-inverse"></i>
                </span>
              </div>
              <div>
                <small class="text-muted">{{ $t('admin.preview_id') }}</small>
                <div class="preview-id text-success font-weight-bold">
                  {{ generatedPreviewId }}
                </div>
              </div>
              <div class="ml-auto">
                <b-button variant="link" size="sm" @click="resetVulnIdDefaults">
                  <i class="fa fa-undo"></i> {{ $t('admin.reset_to_defaults') }}
                </b-button>
              </div>
            </div>
          </div>
        </b-card-body>
        <b-card-footer>
          <b-button variant="outline-primary" class="px-4" @click="saveVulnIdConfig">
            {{ $t('message.update') }}
          </b-button>
        </b-card-footer>
        </b-card>
      </b-tab>

      <!-- Text & Placeholders Tab -->
      <b-tab :title="$t('admin.text_and_placeholders')">
        <b-card no-body class="mb-4">
        <b-card-body>
        <b-form-group class="mb-4">
          <c-switch
            color="primary"
            v-model="textConfig.enabled"
            label
            v-bind="labelIcon"
          />{{ $t('admin.enable_text_and_placeholders') }}
        </b-form-group>

        <b-collapse :visible="textConfig.enabled">
        <b-card class="mb-4">
          <h5 class="mb-3">{{ $t('admin.create_vulnerability_texts') }}</h5>

          <b-form-group :label="$t('admin.description_placeholder')">
            <b-form-textarea
              v-model="textConfig.descriptionPlaceholder"
              rows="5"
              :placeholder="$t('admin.description_placeholder_default')"
            />
          </b-form-group>

          <b-form-group :label="$t('admin.recommendation_placeholder')">
            <b-form-textarea
              v-model="textConfig.recommendationPlaceholder"
              rows="5"
              :placeholder="$t('admin.recommendation_placeholder_default')"
            />
          </b-form-group>

          <b-form-group :label="$t('message.details')">
            <b-form-textarea
              v-model="textConfig.detailPlaceholder"
              rows="5"
              :placeholder="$t('admin.detail_placeholder_default')"
            />
          </b-form-group>

          <b-form-group :label="$t('message.references')">
            <b-form-textarea
              v-model="textConfig.referencesPlaceholder"
              rows="5"
              :placeholder="$t('admin.references_placeholder_default')"
            />
          </b-form-group>
        </b-card>

        <b-card class="mb-4">
          <h5 class="mb-3">{{ $t('admin.audit_vulnerability_texts') }}</h5>

          <b-form-group :label="$t('admin.risk_justification_placeholder')">
            <b-form-textarea
              v-model="textConfig.riskJustificationPlaceholder"
              rows="5"
              :placeholder="$t('admin.risk_justification_placeholder_default')"
            />
          </b-form-group>

          <b-form-group :label="$t('admin.residual_risk_placeholder')">
            <b-form-textarea
              v-model="textConfig.residualRiskPlaceholder"
              rows="5"
              :placeholder="$t('admin.residual_risk_placeholder_default')"
            />
          </b-form-group>

          <b-form-group :label="$t('message.comment')">
            <b-form-textarea
              v-model="textConfig.commentPlaceholder"
              rows="5"
              :placeholder="$t('audit.comment_placeholder')"
            />
          </b-form-group>

          <b-form-group :label="$t('message.details')">
            <b-form-textarea
              v-model="textConfig.analysisDetailsInstruction"
              rows="5"
              :placeholder="$t('audit.details_instruction')"
            />
          </b-form-group>
        </b-card>
        </b-collapse>
        </b-card-body>
        <b-card-footer>
          <b-button variant="outline-primary" class="px-4" @click="saveTextConfig">
            {{ $t('message.update') }}
          </b-button>
        </b-card-footer>
        </b-card>
      </b-tab>

      <!-- Risk Matrix Tab -->
      <b-tab :title="$t('admin.risk_matrix')">
        <risk-matrix />
      </b-tab>

      <!-- Vulnerability Sources Tab -->
      <b-tab :title="$t('admin.vulnerability_sources')">
        <vulnerability-source />
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import { Switch as cSwitch } from '@coreui/vue';
import permissionsMixin from '../../../mixins/permissionsMixin';
import configPropertyMixin from '../mixins/configPropertyMixin';
import RiskMatrix from './RiskMatrix.vue';
import VulnerabilitySource from './VulnerabilitySource.vue';

export default {
  name: 'Customization',
  mixins: [permissionsMixin, configPropertyMixin],
  components: {
    cSwitch,
    RiskMatrix,
    VulnerabilitySource,
  },
  data() {
    return {
      activeTab: 0,
      availablePlaceholders: ['{ORG_NAME}', '{PROJECT_NAME}', '{YYYY}', '{MM}', '{DD}', '{SEQUENCE}'],
      resetPolicyOptions: [
        { value: 'NEVER', text: this.$t('admin.reset_policy_never') },
        { value: 'YEARLY', text: this.$t('admin.reset_policy_yearly') },
        { value: 'MONTHLY', text: this.$t('admin.reset_policy_monthly') },
        { value: 'DAILY', text: this.$t('admin.reset_policy_daily') },
      ],
      vulnIdConfig: {
        useCustomId: false,
        orgCode: '',
        projectCode: '',
        template: '{ORG_NAME}-{PROJECT_NAME}-{YYYY}-{SEQUENCE}',
        sequencePadding: 5,
        resetPolicy: 'YEARLY',
      },
      textConfig: {
        enabled: false,
        descriptionPlaceholder: '',
        detailPlaceholder: '',
        recommendationPlaceholder: '',
        referencesPlaceholder: '',
        riskJustificationPlaceholder: '',
        residualRiskPlaceholder: '',
        commentPlaceholder: '',
        analysisDetailsInstruction: '',
      },
      isLoading: false,
    };
  },
  computed: {
    generatedPreviewId() {
      if (!this.vulnIdConfig.useCustomId) {
        return 'INT-xxxx-xxxx-xxxx';
      }
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const day = String(new Date().getDate()).padStart(2, '0');
      const seq = '1'.padStart(this.vulnIdConfig.sequencePadding, '0');
      const sanitizedProjectCode = this.sanitizeProjectCode(this.vulnIdConfig.projectCode || 'My Project Name');

      let id = this.vulnIdConfig.template || '{ORG_NAME}-{PROJECT_NAME}-{YYYY}-{SEQUENCE}';
      id = id.replace(/{ORG_NAME}/g, this.vulnIdConfig.orgCode || 'OWASP');
      id = id.replace(/{ORG_CODE}/g, this.vulnIdConfig.orgCode || 'OWASP');
      id = id.replace(/{PROJECT_NAME}/g, sanitizedProjectCode);
      id = id.replace(/{PROJECT_CODE}/g, sanitizedProjectCode);
      id = id.replace(/{YYYY}/g, year);
      id = id.replace(/{MM}/g, month);
      id = id.replace(/{DD}/g, day);
      id = id.replace(/{SEQUENCE}/g, seq);

      return id;
    },
  },
  watch: {
    '$route.hash': {
      immediate: true,
      handler(hash) {
        this.setTabFromHash(hash);
      },
    },
  },
  methods: {
    sanitizeProjectCode(projectCode) {
      if (!projectCode || !projectCode.trim()) {
        return 'project_name';
      }

      let sanitized = projectCode.trim()
        .replace(/[^a-zA-Z0-9_-]/g, '')
        .replace(/[_-]{2,}/g, '_')
        .replace(/^[_-]+|[_-]+$/g, '');

      if (!sanitized) {
        sanitized = 'project_name';
      }

      return sanitized;
    },
    setTabFromHash(hash) {
      const tabMap = {
        '#vulnerability-ids': 0,
        '#text-placeholders': 1,
        '#risk-matrix': 2,
        '#vulnerability-sources': 3,
      };
      const maxTabIndex = 3;
      if (hash && tabMap[hash] !== undefined) {
        this.activeTab = tabMap[hash];
      } else {
        // Restore from localStorage
        const saved = localStorage.getItem('customization-active-tab');
        if (saved !== null) {
          const parsedTab = parseInt(saved, 10);
          if (!Number.isNaN(parsedTab) && parsedTab >= 0 && parsedTab <= maxTabIndex) {
            this.activeTab = parsedTab;
          } else {
            this.activeTab = 0;
            localStorage.setItem('customization-active-tab', 0);
          }
        }
      }
    },
    onTabChange(tabIndex) {
      localStorage.setItem('customization-active-tab', tabIndex);
      const hashMap = ['#vulnerability-ids', '#text-placeholders', '#risk-matrix', '#vulnerability-sources'];
      if (this.$route.hash !== hashMap[tabIndex]) {
        this.$router.replace({ hash: hashMap[tabIndex] }).catch(() => {});
      }
    },
    insertPlaceholder(placeholder) {
      const t = this.vulnIdConfig.template;
      if (t && !t.endsWith('-') && !t.endsWith('_') && !t.endsWith('/')) {
        this.vulnIdConfig.template = t + '-' + placeholder;
      } else {
        this.vulnIdConfig.template = t + placeholder;
      }
    },
    resetVulnIdDefaults() {
      this.vulnIdConfig = {
        useCustomId: false,
        orgCode: '',
        projectCode: '',
        template: '{ORG_NAME}-{PROJECT_NAME}-{YYYY}-{SEQUENCE}',
        sequencePadding: 5,
        resetPolicy: 'YEARLY',
      };
    },
    async saveVulnIdConfig() {
      if (this.vulnIdConfig.useCustomId) {
        if (!this.vulnIdConfig.orgCode || !this.vulnIdConfig.orgCode.trim()) {
          this.$toastr.w(this.$t('admin.organization_code_required'));
          return;
        }

      }
      try {
        this.isLoading = true;
        const payload = {
          useCustomId: this.vulnIdConfig.useCustomId,
          orgCode: this.vulnIdConfig.orgCode,
          projectCode: this.vulnIdConfig.projectCode || '',
          template: this.vulnIdConfig.template,
          resetPolicy: this.vulnIdConfig.resetPolicy,
          sequencePadding: this.vulnIdConfig.sequencePadding,
        };

        const response = await this.$customization.updateVulnerabilityIdSettings(payload);
        if (response.status >= 200 && response.status < 300) {
          this.$toastr.s(this.$t('admin.configuration_saved'));
        }
      } catch (error) {
        this.$toastr.w(this.$t('condition.unsuccessful_action'));
        console.error('Failed to save vulnerability ID configuration:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async saveTextConfig() {
      try {
        this.isLoading = true;
        const payload = {
          enabled: this.textConfig.enabled,
          descriptionPlaceholder: this.textConfig.descriptionPlaceholder,
          detailPlaceholder: this.textConfig.detailPlaceholder,
          recommendationPlaceholder: this.textConfig.recommendationPlaceholder,
          referencesPlaceholder: this.textConfig.referencesPlaceholder,
          riskJustificationPlaceholder: this.textConfig.riskJustificationPlaceholder,
          residualRiskPlaceholder: this.textConfig.residualRiskPlaceholder,
          commentPlaceholder: this.textConfig.commentPlaceholder,
          analysisDetailsInstruction: this.textConfig.analysisDetailsInstruction,
        };
        const response = await this.$customization.updateTextPlaceholderSettings(payload);
        if (response.status >= 200 && response.status < 300) {
          this.$toastr.s(this.$t('admin.configuration_saved'));
        }
      } catch (error) {
        this.$toastr.w(this.$t('condition.unsuccessful_action'));
        console.error('Failed to save text placeholder configuration:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async loadConfig() {
      try {
        this.isLoading = true;
        const [vulnIdResponse, textResponse] = await Promise.all([
          this.$customization.getVulnerabilityIdSettings().catch((error) => {
            console.warn('Failed to load vulnerability ID configuration from backend, using defaults:', error);
            return null;
          }),
          this.$customization.getTextPlaceholderSettings().catch((error) => {
            console.warn('Failed to load text placeholder configuration from backend, using defaults:', error);
            return null;
          }),
        ]);

        if (vulnIdResponse && vulnIdResponse.data) {
          // Load from API
          this.vulnIdConfig = {
            useCustomId: vulnIdResponse.data.useCustomId === true,
            orgCode: !vulnIdResponse.data.orgCode || vulnIdResponse.data.orgCode === 'DT'
              ? ''
              : vulnIdResponse.data.orgCode,
            projectCode: !vulnIdResponse.data.projectCode || vulnIdResponse.data.projectCode === 'project'
              ? ''
              : vulnIdResponse.data.projectCode,
            template: vulnIdResponse.data.template || '{ORG_NAME}-{PROJECT_NAME}-{YYYY}-{SEQUENCE}',
            sequencePadding: vulnIdResponse.data.sequencePadding || 5,
            resetPolicy: vulnIdResponse.data.resetPolicy || 'YEARLY',
          };
        }

        if (textResponse && textResponse.data) {
          this.textConfig = {
            enabled: textResponse.data.enabled === true,
            descriptionPlaceholder: textResponse.data.descriptionPlaceholder || '',
            detailPlaceholder: textResponse.data.detailPlaceholder || '',
            recommendationPlaceholder: textResponse.data.recommendationPlaceholder || '',
            referencesPlaceholder: textResponse.data.referencesPlaceholder || '',
            riskJustificationPlaceholder: textResponse.data.riskJustificationPlaceholder || '',
            residualRiskPlaceholder: textResponse.data.residualRiskPlaceholder || '',
            commentPlaceholder: textResponse.data.commentPlaceholder || '',
            analysisDetailsInstruction: textResponse.data.analysisDetailsInstruction || '',
          };
        }
      } catch (error) {
        console.warn('Failed to load customization configuration, using defaults:', error);
      } finally {
        this.isLoading = false;
      }
    },
  },
  mounted() {
    this.loadConfig();
  },
};
</script>

<style scoped>
.preview-box {
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-id {
  font-size: 1.25rem;
  font-family: monospace;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
