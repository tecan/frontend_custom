<template>
  <div>
    <p class="text-muted mb-4">
      {{ $t('admin.customization_desc') }}
    </p>

    <b-tabs v-model="activeTab" content-class="mt-3" @input="onTabChange">
      <!-- Vulnerability IDs Tab -->
      <b-tab :title="$t('admin.vulnerability_ids')">
        <b-card class="mb-4">
          <h5 class="mb-3">
            {{ $t('admin.vulnerability_id_generation') }}
            <b-badge variant="secondary" class="ml-2">{{ $t('admin.preview') }}</b-badge>
          </h5>

          <b-row>
            <b-col md="6">
              <b-form-group :label="$t('admin.organization_code')">
                <b-form-input
                  v-model="vulnIdConfig.orgCode"
                  :placeholder="$t('admin.organization_code_placeholder')"
                  maxlength="20"
                />
                <b-form-text>{{ $t('admin.organization_code_help') }}</b-form-text>
              </b-form-group>
            </b-col>
            <b-col md="6">
              <b-form-group :label="$t('admin.project_code')">
                <b-form-input
                  v-model="vulnIdConfig.projectCode"
                  :placeholder="$t('admin.project_code_placeholder')"
                  maxlength="20"
                />
                <b-form-text>{{ $t('admin.project_code_help') }}</b-form-text>
              </b-form-group>
            </b-col>
          </b-row>

          <b-row>
            <b-col md="6">
              <b-form-group :label="$t('admin.vulnerability_id_template')">
                <b-form-input
                  v-model="vulnIdConfig.template"
                  placeholder="{ORG_CODE}-{PROJECT_NAME}-{YYYY}-{SEQUENCE}"
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
        </b-card>

        <div class="text-right">
          <b-button variant="outline-primary" class="px-4" @click="saveVulnIdConfig">
            {{ $t('message.update') }}
          </b-button>
        </div>
      </b-tab>

      <!-- Text & Placeholders Tab -->
      <b-tab :title="$t('admin.text_and_placeholders')">
        <b-card class="mb-4">
          <h5 class="mb-3">{{ $t('admin.create_vulnerability_texts') }}</h5>

          <b-form-group :label="$t('admin.description_placeholder')">
            <b-form-textarea
              v-model="textConfig.descriptionPlaceholder"
              rows="2"
              :placeholder="$t('admin.description_placeholder_default')"
            />
          </b-form-group>

          <b-form-group :label="$t('admin.recommendation_placeholder')">
            <b-form-textarea
              v-model="textConfig.recommendationPlaceholder"
              rows="2"
              :placeholder="$t('admin.recommendation_placeholder_default')"
            />
          </b-form-group>

          <b-form-group :label="$t('message.details')">
            <b-form-textarea
              v-model="textConfig.detailPlaceholder"
              rows="2"
              placeholder="<Add additional details>"
            />
          </b-form-group>

          <b-form-group :label="$t('message.references')">
            <b-form-textarea
              v-model="textConfig.referencesPlaceholder"
              rows="2"
              placeholder="<Add any references if available, example: CPE / CVE references>"
            />
          </b-form-group>
        </b-card>

        <b-card class="mb-4">
          <h5 class="mb-3">{{ $t('admin.audit_vulnerability_texts') }}</h5>

          <b-form-group :label="$t('admin.risk_justification_placeholder')">
            <b-form-textarea
              v-model="textConfig.riskJustificationPlaceholder"
              rows="2"
              :placeholder="$t('admin.risk_justification_placeholder_default')"
            />
          </b-form-group>

          <b-form-group :label="$t('admin.residual_risk_placeholder')">
            <b-form-textarea
              v-model="textConfig.residualRiskPlaceholder"
              rows="2"
              :placeholder="$t('admin.residual_risk_placeholder_default')"
            />
          </b-form-group>

          <b-form-group :label="$t('message.comment')">
            <b-form-textarea
              v-model="textConfig.commentPlaceholder"
              rows="2"
              :placeholder="$t('audit.comment_placeholder')"
            />
          </b-form-group>

          <b-form-group :label="$t('message.details')">
            <b-form-textarea
              v-model="textConfig.analysisDetailsInstruction"
              rows="6"
              :placeholder="$t('audit.details_instruction')"
            />
          </b-form-group>
        </b-card>

        <div class="text-right">
          <b-button variant="outline-primary" class="px-4" @click="saveTextConfig">
            {{ $t('message.update') }}
          </b-button>
        </div>
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
import permissionsMixin from '../../../mixins/permissionsMixin';
import RiskMatrix from './RiskMatrix.vue';
import VulnerabilitySource from './VulnerabilitySource.vue';

export default {
  name: 'Customization',
  mixins: [permissionsMixin],
  components: {
    RiskMatrix,
    VulnerabilitySource,
  },
  data() {
    return {
      activeTab: 0,
      availablePlaceholders: ['{ORG_CODE}', '{PROJECT_NAME}', '{PROJECT_CODE}', '{YYYY}', '{MM}', '{DD}', '{SEQUENCE}'],
      resetPolicyOptions: [
        { value: 'NEVER', text: this.$t('admin.reset_policy_never') },
        { value: 'YEARLY', text: this.$t('admin.reset_policy_yearly') },
        { value: 'MONTHLY', text: this.$t('admin.reset_policy_monthly') },
        { value: 'DAILY', text: this.$t('admin.reset_policy_daily') },
      ],
      vulnIdConfig: {
        orgCode: 'DT',
        projectCode: 'project',
        template: '{ORG_CODE}-{PROJECT_NAME}-{YYYY}-{SEQUENCE}',
        sequencePadding: 5,
        resetPolicy: 'YEARLY',
      },
      textConfig: {
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
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const day = String(new Date().getDate()).padStart(2, '0');
      const seq = '1'.padStart(this.vulnIdConfig.sequencePadding, '0');

      let id = this.vulnIdConfig.template || '{ORG_CODE}-{PROJECT_NAME}-{YYYY}-{SEQUENCE}';
      id = id.replace(/{ORG_CODE}/g, this.vulnIdConfig.orgCode || 'TECAN');
      id = id.replace(/{PROJECT_NAME}/g, this.vulnIdConfig.projectCode || 'myproject');
      id = id.replace(/{PROJECT_CODE}/g, this.vulnIdConfig.projectCode || 'myproject');
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
      this.vulnIdConfig.template += placeholder;
    },
    resetVulnIdDefaults() {
      this.vulnIdConfig = {
        orgCode: 'DT',
        projectCode: 'project',
        template: '{ORG_CODE}-{PROJECT_NAME}-{YYYY}-{SEQUENCE}',
        sequencePadding: 5,
        resetPolicy: 'YEARLY',
      };
    },
    async saveVulnIdConfig() {
      try {
        this.isLoading = true;
        const payload = {
          orgCode: this.vulnIdConfig.orgCode,
          projectCode: this.vulnIdConfig.projectCode,
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
            orgCode: vulnIdResponse.data.orgCode || 'DT',
            projectCode: vulnIdResponse.data.projectCode || 'project',
            template: vulnIdResponse.data.template || '{ORG_CODE}-{PROJECT_NAME}-{YYYY}-{SEQUENCE}',
            sequencePadding: vulnIdResponse.data.sequencePadding || 5,
            resetPolicy: vulnIdResponse.data.resetPolicy || 'YEARLY',
          };
        }

        if (textResponse && textResponse.data) {
          this.textConfig = {
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
