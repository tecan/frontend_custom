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
                  :placeholder="{org}-{project}-{year}-{seq}"
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
                  v-model.number="vulnIdConfig.padding"
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
          <b-button variant="primary" @click="saveVulnIdConfig">
            {{ $t('message.save_changes') }}
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
        </b-card>

        <div class="text-right">
          <b-button variant="primary" @click="saveTextConfig">
            {{ $t('message.save_changes') }}
          </b-button>
        </div>
      </b-tab>

      <!-- Severity & Risk Model Tab -->
      <b-tab :title="$t('admin.severity_and_risk_model')">
        <p class="text-muted mb-3">
          {{ $t('admin.severity_levels_desc') }}
        </p>
        <severity-levels />
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import permissionsMixin from '../../../mixins/permissionsMixin';
import SeverityLevels from './SeverityLevels.vue';

export default {
  name: 'Customization',
  mixins: [permissionsMixin],
  components: {
    SeverityLevels,
  },
  data() {
    return {
      activeTab: 0,
      availablePlaceholders: ['{org}', '{project}', '{year}', '{seq}'],
      resetPolicyOptions: [
        { value: 'NEVER', text: this.$t('admin.reset_policy_never') },
        { value: 'YEARLY', text: this.$t('admin.reset_policy_yearly') },
        { value: 'MONTHLY', text: this.$t('admin.reset_policy_monthly') },
      ],
      vulnIdConfig: {
        orgCode: '',
        projectCode: '',
        template: '{org}-{project}-{year}-{seq}',
        padding: 4,
        resetPolicy: 'YEARLY',
      },
      textConfig: {
        descriptionPlaceholder: '',
        recommendationPlaceholder: '',
        riskJustificationPlaceholder: '',
        residualRiskPlaceholder: '',
      },
    };
  },
  computed: {
    generatedPreviewId() {
      const year = new Date().getFullYear();
      const seq = '1'.padStart(this.vulnIdConfig.padding, '0');

      let id = this.vulnIdConfig.template || '{org}-{year}-{seq}';
      id = id.replace('{org}', this.vulnIdConfig.orgCode || 'ORG');
      id = id.replace('{project}', this.vulnIdConfig.projectCode || 'PROJECT');
      id = id.replace('{year}', year);
      id = id.replace('{seq}', seq);

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
        '#severity': 2,
      };
      if (hash && tabMap[hash] !== undefined) {
        this.activeTab = tabMap[hash];
      } else {
        // Restore from localStorage
        const saved = localStorage.getItem('customization-active-tab');
        if (saved !== null) {
          this.activeTab = parseInt(saved, 10);
        }
      }
    },
    onTabChange(tabIndex) {
      localStorage.setItem('customization-active-tab', tabIndex);
      const hashMap = ['#vulnerability-ids', '#text-placeholders', '#severity'];
      if (this.$route.hash !== hashMap[tabIndex]) {
        this.$router.replace({ hash: hashMap[tabIndex] }).catch(() => {});
      }
    },
    insertPlaceholder(placeholder) {
      this.vulnIdConfig.template += placeholder;
    },
    resetVulnIdDefaults() {
      this.vulnIdConfig = {
        orgCode: '',
        projectCode: '',
        template: '{org}-{project}-{year}-{seq}',
        padding: 4,
        resetPolicy: 'YEARLY',
      };
    },
    saveVulnIdConfig() {
      // TODO: Implement API call to save vulnerability ID configuration
      this.$toastr.s(this.$t('message.configuration_saved'));
    },
    saveTextConfig() {
      // TODO: Implement API call to save text configuration
      this.$toastr.s(this.$t('message.configuration_saved'));
    },
    loadConfig() {
      // TODO: Load configuration from backend API
      // For now, using default values
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
