<template>
  <b-row class="expanded-row">
    <b-col sm="6">
      <div
        v-if="
          finding.vulnerability.aliases &&
          finding.vulnerability.aliases.length > 0
        "
      >
        <label>Aliases</label>
        <b-card class="font-weight-bold">
          <b-card-text>
            <span
              v-for="alias in resolveVulnAliases(
                finding.vulnerability.aliases,
                finding.vulnerability.source,
              )"
              :key="alias.vulnId"
            >
              <b-link
                style="margin-right: 1rem"
                :href="'/vulnerabilities/' + alias.source + '/' + alias.vulnId"
                >{{ alias.vulnId }}</b-link
              >
            </span>
          </b-card-text>
        </b-card>
      </div>
      <b-form-group
        v-if="finding.vulnerability.title"
        id="fieldset-1"
        :label="this.$t('message.title')"
        label-for="input-1"
      >
        <b-form-input
          id="input-1"
          :value="finding.vulnerability.title"
          class="form-control disabled"
          readonly
          trim
        />
      </b-form-group>
      <b-form-group
        v-if="finding.vulnerability.subtitle"
        id="fieldset-2"
        :label="this.$t('message.subtitle')"
        label-for="input-2"
      >
        <b-form-input
          id="input-2"
          :value="finding.vulnerability.subtitle"
          class="form-control disabled"
          readonly
          trim
        />
      </b-form-group>
      <b-form-group
        v-if="finding.vulnerability.description"
        id="fieldset-3"
        :label="this.$t('message.description')"
        label-for="input-3"
      >
        <b-form-textarea
          id="input-3"
          :value="finding.vulnerability.description"
          rows="7"
          class="form-control disabled"
          readonly
          trim
        />
      </b-form-group>
      <b-form-group v-if="customMatrix && customMatrix.enabled" id="fieldset-risk-matrix" :label="riskAssessmentTitle">
        <div class="risk-matrix-inline">
          <div class="risk-matrix-field">
            <label class="risk-matrix-label" for="riskMatrixImpact">
              {{ axisImpactLabel }} <span v-if="customMatrix && customMatrix.requireRiskAssessment" class="text-danger">*</span>
            </label>
            <b-form-select
              id="riskMatrixImpact"
              v-model="selectedImpact"
              :options="riskImpactChoices"
              :disabled="!canEditRiskMatrix"
            >
              <template #first>
                <b-form-select-option :value="null">
                  {{ $t('riskMatrix.selectPlaceholder') }}
                </b-form-select-option>
              </template>
            </b-form-select>
          </div>
          <div class="risk-matrix-field">
            <label class="risk-matrix-label" for="riskMatrixLikelihood">
              {{ axisLikelihoodLabel }} <span v-if="customMatrix && customMatrix.requireRiskAssessment" class="text-danger">*</span>
            </label>
            <b-form-select
              id="riskMatrixLikelihood"
              v-model="selectedLikelihood"
              :options="riskLikelihoodChoices"
              :disabled="!canEditRiskMatrix"
            >
              <template #first>
                <b-form-select-option :value="null">
                  {{ $t('riskMatrix.selectPlaceholder') }}
                </b-form-select-option>
              </template>
            </b-form-select>
          </div>
          <div class="risk-matrix-field">
            <label class="risk-matrix-label">
              {{ resultLabel }}
            </label>
            <div
              class="calculated-risk-field"
              :class="{ 'calculated-risk-empty': !calculatedRisk }"
              :style="calculatedRisk ? calculatedRiskStyle : null"
            >
              {{ calculatedRiskText }}
            </div>
          </div>
        </div>
        <b-form-group class="mt-2 mb-0" :label="$t('riskMatrix.justificationLabel')">
          <b-form-textarea
            id="riskMatrixJustification"
            v-model="riskJustification"
            rows="6"
            :placeholder="auditTextPlaceholders.riskJustificationPlaceholder"
            :disabled="!canEditRiskMatrix"
          />
        </b-form-group>
      </b-form-group>
      <b-form-group
        v-if="customMatrix && customMatrix.enabled"
        id="fieldset-residual-risk"
        :label="residualRiskTitle"
      >
        <div class="risk-matrix-inline">
          <div class="risk-matrix-field">
            <label class="risk-matrix-label" for="residualRiskImpact">
              {{ axisImpactLabel }} <span v-if="customMatrix && customMatrix.requireResidualRiskAssessment" class="text-danger">*</span>
            </label>
            <b-form-select
              id="residualRiskImpact"
              v-model="residualImpact"
              :options="riskImpactChoices"
              :disabled="!canEditRiskMatrix"
            >
              <template #first>
                <b-form-select-option :value="null">
                  {{ $t('riskMatrix.selectPlaceholder') }}
                </b-form-select-option>
              </template>
            </b-form-select>
          </div>
          <div class="risk-matrix-field">
            <label class="risk-matrix-label" for="residualRiskLikelihood">
              {{ axisLikelihoodLabel }} <span v-if="customMatrix && customMatrix.requireResidualRiskAssessment" class="text-danger">*</span>
            </label>
            <b-form-select
              id="residualRiskLikelihood"
              v-model="residualLikelihood"
              :options="riskLikelihoodChoices"
              :disabled="!canEditRiskMatrix"
            >
              <template #first>
                <b-form-select-option :value="null">
                  {{ $t('riskMatrix.selectPlaceholder') }}
                </b-form-select-option>
              </template>
            </b-form-select>
          </div>
          <div class="risk-matrix-field">
            <label class="risk-matrix-label">
              {{ resultLabel }}
            </label>
            <div
              class="calculated-risk-field"
              :class="{ 'calculated-risk-empty': !residualCalculatedRisk }"
              :style="residualCalculatedRisk ? residualCalculatedRiskStyle : null"
            >
              {{ residualCalculatedRiskText }}
            </div>
          </div>
        </div>
        <b-form-group class="mt-2 mb-0" :label="$t('riskMatrix.justificationLabel')">
          <b-form-textarea
            id="residualRiskJustification"
            v-model="residualRiskJustification"
            rows="6"
            :placeholder="auditTextPlaceholders.residualRiskPlaceholder"
            :disabled="!canEditRiskMatrix"
          />
        </b-form-group>
      </b-form-group>
      <b-form-group
        v-if="finding.vulnerability.recommendation"
        id="fieldset-4"
        :label="this.$t('message.recommendation')"
        label-for="input-4"
      >
        <b-form-textarea
          id="input-4"
          :value="finding.vulnerability.recommendation"
          rows="7"



          trim
        />
      </b-form-group>
      <b-form-group
        v-if="finding.vulnerability.cvssV3Vector"
        id="fieldset-6"
        :label="this.$t('message.cvss_v3_vector')"
        label-for="input-6"
      >
        <b-form-input
          id="input-6"
          :value="finding.vulnerability.cvssV3Vector"
          class="form-control disabled"
          readonly
          trim
        />
      </b-form-group>
    </b-col>
    <b-col sm="6">
      <b-form-group
        id="fieldset-7"
        :label="this.$t('message.audit_trail')"
        label-for="auditTrailField"
      >
        <b-form-textarea
          id="auditTrailField"
          v-model="auditTrail"
          rows="7"
          class="form-control disabled"
          readonly
          trim
        />
      </b-form-group>
      <b-form-group
        id="fieldset-8"
        v-if="this.isPermitted(this.PERMISSIONS.VULNERABILITY_ANALYSIS)"
        :label="this.$t('message.comment')"
        label-for="input-8"
      >
        <b-form-textarea
          id="input-8"
          v-model="comment"
          :placeholder="auditTextPlaceholders.commentPlaceholder"
          rows="4"
          class="form-control"
          trim
        />
        <div class="pull-right">
          <b-button size="sm" variant="outline-primary" @click="addComment"
            ><span class="fa fa-comment-o"></span>
            {{ this.$t('message.add_comment') }}</b-button
          >
        </div>
      </b-form-group>
      <b-form-group
        id="fieldset-9"
        v-if="this.isPermitted(this.PERMISSIONS.VULNERABILITY_ANALYSIS)"
        :label="this.$t('message.analysis')"
        label-for="input-9"
      >
        <b-input-group id="input-9">
          <b-form-select
            v-model="analysisState"
            :options="analysisChoices"
            @change="makeAnalysis"
            style="flex: 0 1 auto; width: auto; margin-right: 2rem"
            v-b-tooltip.hover
            :title="this.$t('message.analysis_tooltip')"
          />
          <bootstrap-toggle
            v-model="isSuppressed"
            :options="{
              on: this.$t('message.suppressed'),
              off: this.$t('message.suppress'),
              onstyle: 'warning',
              offstyle: 'outline-disabled',
            }"
            :disabled="analysisState === null"
          />
        </b-input-group>
      </b-form-group>
      <b-row v-if="this.isPermitted(this.PERMISSIONS.VULNERABILITY_ANALYSIS)">
        <b-col sm="6">
          <b-form-group
            id="fieldset-10"
            :label="this.$t('message.justification')"
            label-for="input-10"
          >
            <b-input-group id="input-10">
              <b-form-select
                v-model="analysisJustification"
                :options="justificationChoices"
                @change="makeAnalysis"
                :disabled="
                  analysisState === null || analysisState !== 'NOT_AFFECTED'
                "
                v-b-tooltip.hover
                :title="$t('message.justification_tooltip')"
              />
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col sm="6">
          <b-form-group
            id="fieldset-11"
            :label="this.$t('message.response')"
            label-for="input-11"
          >
            <b-input-group id="input-11">
              <b-form-select
                v-model="analysisResponse"
                :options="responseChoices"
                :disabled="analysisState === null"
                @change="makeAnalysis"
                v-b-tooltip.hover
                :title="this.$t('message.response_tooltip')"
              />
            </b-input-group>
          </b-form-group>
        </b-col>
      </b-row>
      <b-form-group
        id="fieldset-12"
        v-if="this.isPermitted(this.PERMISSIONS.VIEW_VULNERABILITY)"
        :label="this.$t('message.details')"
        label-for="analysisDetailsField"
      >
        <b-form-textarea
          id="analysisDetailsField"
          v-model="localAnalysisDetails"
          rows="7"
          :class="['form-control', { 'text-muted': detailsWasEmptyOnLoad && localAnalysisDetails === analysisDetailsInstructionText }]"
          :disabled="!this.isPermitted(this.PERMISSIONS.VULNERABILITY_ANALYSIS)"
          v-b-tooltip.hover
          :title="this.$t('message.analysis_details_tooltip')"
          aria-describedby="analysisDetailsInstruction"
        />
        <small id="analysisDetailsInstruction" class="sr-only">{{ analysisDetailsInstructionText }}</small>
        <div class="pull-right">
          <b-button
            v-if="this.isPermitted(this.PERMISSIONS.VULNERABILITY_ANALYSIS)"
            size="sm"
            variant="outline-primary"
            @click="makeAnalysis()"
            ><span class="fa fa-comment-o"></span>
            {{ this.$t('message.update_details') }}</b-button
          >
        </div>
      </b-form-group>
    </b-col>
  </b-row>
</template>

<script>
import common from '@/shared/common';
import BootstrapToggle from 'vue-bootstrap-toggle';
import permissionsMixin from '@/mixins/permissionsMixin';
import { contrastTextColor } from '@/shared/colorUtils';

const RISK_MATRIX_TABLE = {
  VIRTUALLY_IMPOSSIBLE: {
    LOW: { rating: 'very_low', action: 'accept', color: '#4CAF50' },
    MEDIUM: { rating: 'very_low', action: 'accept', color: '#4CAF50' },
    HIGH: { rating: 'low', action: 'monitor', color: '#8BC34A' },
    CRITICAL: { rating: 'low', action: 'monitor', color: '#8BC34A' },
  },
  UNLIKELY: {
    LOW: { rating: 'very_low', action: 'accept', color: '#4CAF50' },
    MEDIUM: { rating: 'low', action: 'monitor', color: '#8BC34A' },
    HIGH: { rating: 'medium', action: 'monitor_plan', color: '#FF9800' },
    CRITICAL: { rating: 'high', action: 'mitigate', color: '#f44336' },
  },
  POSSIBLE: {
    LOW: { rating: 'low', action: 'monitor', color: '#8BC34A' },
    MEDIUM: { rating: 'medium', action: 'monitor_plan', color: '#FF9800' },
    HIGH: { rating: 'high', action: 'mitigate', color: '#f44336' },
    CRITICAL: { rating: 'critical', action: 'mitigate_immediately', color: '#D32F2F' },
  },
  LIKELY: {
    LOW: { rating: 'low', action: 'monitor', color: '#8BC34A' },
    MEDIUM: { rating: 'high', action: 'mitigate', color: '#f44336' },
    HIGH: { rating: 'high', action: 'mitigate', color: '#f44336' },
    CRITICAL: { rating: 'critical', action: 'mitigate_immediately', color: '#D32F2F' },
  },
  ALMOST_CERTAIN: {
    LOW: { rating: 'low', action: 'monitor', color: '#8BC34A' },
    MEDIUM: { rating: 'high', action: 'mitigate', color: '#f44336' },
    HIGH: { rating: 'critical', action: 'mitigate_immediately', color: '#D32F2F' },
    CRITICAL: { rating: 'critical', action: 'mitigate_immediately', color: '#D32F2F' },
  },
};

export default {
  props: {
    finding: Object,
    projectUuid: String,
    onSeverityUpdated: { type: Function, default: null },
  },
  data() {
    return {
      auditTrail: null,
      comment: null,
      isSuppressed: !!this.finding?.analysis?.isSuppressed,
      analysisChoices: [
        { value: 'NOT_SET', text: this.$t('message.not_set') },
        { value: 'EXPLOITABLE', text: this.$t('message.exploitable') },
        { value: 'IN_TRIAGE', text: this.$t('message.in_triage') },
        { value: 'RESOLVED', text: this.$t('message.resolved') },
        { value: 'FALSE_POSITIVE', text: this.$t('message.false_positive') },
        { value: 'NOT_AFFECTED', text: this.$t('message.not_affected') },
      ],
      justificationChoices: [
        { value: 'NOT_SET', text: this.$t('message.not_set') },
        {
          value: 'CODE_NOT_PRESENT',
          text: this.$t('message.code_not_present'),
        },
        {
          value: 'CODE_NOT_REACHABLE',
          text: this.$t('message.code_not_reachable'),
        },
        {
          value: 'REQUIRES_CONFIGURATION',
          text: this.$t('message.requires_configuration'),
        },
        {
          value: 'REQUIRES_DEPENDENCY',
          text: this.$t('message.requires_dependency'),
        },
        {
          value: 'REQUIRES_ENVIRONMENT',
          text: this.$t('message.requires_environment'),
        },
        {
          value: 'PROTECTED_BY_COMPILER',
          text: this.$t('message.protected_by_compiler'),
        },
        {
          value: 'PROTECTED_AT_RUNTIME',
          text: this.$t('message.protected_at_runtime'),
        },
        {
          value: 'PROTECTED_AT_PERIMETER',
          text: this.$t('message.protected_at_perimeter'),
        },
        {
          value: 'PROTECTED_BY_MITIGATING_CONTROL',
          text: this.$t('message.protected_by_mitigating_control'),
        },
      ],
      responseChoices: [
        { value: 'NOT_SET', text: this.$t('message.not_set') },
        { value: 'CAN_NOT_FIX', text: this.$t('message.can_not_fix') },
        { value: 'WILL_NOT_FIX', text: this.$t('message.will_not_fix') },
        { value: 'UPDATE', text: this.$t('message.update') },
        { value: 'ROLLBACK', text: this.$t('message.rollback') },
        {
          value: 'WORKAROUND_AVAILABLE',
          text: this.$t('message.workaround_available'),
        },
      ],
      analysisState: null,
      analysisJustification: null,
      analysisResponse: null,
      analysisDetails: null,
      localAnalysisDetails: null,
      detailsWasEmptyOnLoad: false,
      customMatrix: null,
      selectedImpact: null,
      selectedLikelihood: null,
      residualImpact: null,
      residualLikelihood: null,
      riskImpactChoices: [
        { value: 'LOW', text: this.$t('severity.low') },
        { value: 'MEDIUM', text: this.$t('severity.medium') },
        { value: 'HIGH', text: this.$t('severity.high') },
        { value: 'CRITICAL', text: this.$t('severity.critical') },
      ],
      riskLikelihoodChoices: [
        {
          value: 'VIRTUALLY_IMPOSSIBLE',
          text: this.$t('riskMatrix.likelihoods.virtually_impossible'),
        },
        { value: 'UNLIKELY', text: this.$t('riskMatrix.likelihoods.unlikely') },
        { value: 'POSSIBLE', text: this.$t('riskMatrix.likelihoods.possible') },
        { value: 'LIKELY', text: this.$t('riskMatrix.likelihoods.likely') },
        {
          value: 'ALMOST_CERTAIN',
          text: this.$t('riskMatrix.likelihoods.almost_certain'),
        },
      ],
      riskJustification: '',
      residualRiskJustification: '',
      auditTextPlaceholders: {
        riskJustificationPlaceholder: this.$t('riskMatrix.justificationPlaceholder'),
        residualRiskPlaceholder: this.$t('riskMatrix.justificationPlaceholder'),
        commentPlaceholder: this.$t('audit.comment_placeholder'),
        analysisDetailsInstruction: this.$t('audit.details_instruction'),
      },
    };
  },
  watch: {
    isSuppressed: function (currentValue, oldValue) {
      if (oldValue != null) {
        this.callRestEndpoint(
          this.analysisState,
          this.analysisJustification,
          this.analysisResponse,
          null,
          null,
          currentValue,
        );
      }
    },
    // If the finding prop is passed asynchronously, load analysis when it becomes available
    finding: function (newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.getAnalysis();
        this.selectedImpact = null;
        this.selectedLikelihood = null;
        this.residualImpact = null;
        this.residualLikelihood = null;
        this.riskJustification = '';
        this.residualRiskJustification = '';
      }
    },
  },
  computed: {
    calculatedRisk() {
      return this.lookupRiskEntry(
        this.selectedLikelihood,
        this.selectedImpact,
      );
    },
    calculatedRiskText() {
      if (!this.calculatedRisk) {
        return '--';
      }
      return `${this.calculatedRisk.ratingText} (${this.calculatedRisk.actionText})`;
    },
    calculatedRiskStyle() {
      if (!this.calculatedRisk) {
        return {};
      }
      return {
        backgroundColor: this.calculatedRisk.color,
        color: this.calculatedRisk.textColor,
        borderColor: this.calculatedRisk.textColor,
      };
    },
    residualCalculatedRisk() {
      return this.lookupRiskEntry(
        this.residualLikelihood,
        this.residualImpact,
      );
    },
    residualCalculatedRiskText() {
      if (!this.residualCalculatedRisk) {
        return '--';
      }
      return `${this.residualCalculatedRisk.ratingText} (${this.residualCalculatedRisk.actionText})`;
    },
    residualCalculatedRiskStyle() {
      if (!this.residualCalculatedRisk) {
        return {};
      }
      return {
        backgroundColor: this.residualCalculatedRisk.color,
        color: this.residualCalculatedRisk.textColor,
        borderColor: this.residualCalculatedRisk.textColor,
      };
    },
    canEditRiskMatrix() {
      return this.isPermitted(this.PERMISSIONS.VULNERABILITY_ANALYSIS);
    },
    axisImpactLabel() {
      return (this.customMatrix && this.customMatrix.enabled && this.customMatrix.axisLabels && this.customMatrix.axisLabels.impact)
        ? this.customMatrix.axisLabels.impact
        : this.$t('riskMatrix.impact');
    },
    axisLikelihoodLabel() {
      return (this.customMatrix && this.customMatrix.enabled && this.customMatrix.axisLabels && this.customMatrix.axisLabels.likelihood)
        ? this.customMatrix.axisLabels.likelihood
        : this.$t('riskMatrix.likelihood');
    },
    resultLabel() {
      return (this.customMatrix && this.customMatrix.enabled && this.customMatrix.levelDefinitionsLabel)
        ? this.customMatrix.levelDefinitionsLabel
        : this.$t('riskMatrix.resultLabel');
    },
    riskAssessmentTitle() {
      return (this.customMatrix && this.customMatrix.enabled && this.customMatrix.sectionLabels?.riskAssessment)
        ? this.customMatrix.sectionLabels.riskAssessment
        : this.$t('riskMatrix.title');
    },
    residualRiskTitle() {
      return (this.customMatrix && this.customMatrix.enabled && this.customMatrix.sectionLabels?.residualRisk)
        ? this.customMatrix.sectionLabels.residualRisk
        : this.$t('riskMatrix.residualTitle');
    },
    analysisDetailsInstructionText() {
      return this.auditTextPlaceholders.analysisDetailsInstruction || this.$t('audit.details_instruction');
    },
  },
  mixins: [permissionsMixin],
  methods: {
    applyAuditTextPlaceholderSettings(settings) {
      if (!settings) {
        return;
      }
      this.auditTextPlaceholders = {
        riskJustificationPlaceholder: settings.riskJustificationPlaceholder || this.$t('riskMatrix.justificationPlaceholder'),
        residualRiskPlaceholder: settings.residualRiskPlaceholder || this.$t('riskMatrix.justificationPlaceholder'),
        commentPlaceholder: settings.commentPlaceholder || this.$t('audit.comment_placeholder'),
        analysisDetailsInstruction: settings.analysisDetailsInstruction || this.$t('audit.details_instruction'),
      };
    },
    loadAuditTextPlaceholderSettings() {
      if (!this.$customization) {
        return;
      }
      if (this.$customization.getCachedTextPlaceholderSettings) {
        this.applyAuditTextPlaceholderSettings(this.$customization.getCachedTextPlaceholderSettings());
      }
      if (this.$customization.preloadTextPlaceholderSettings) {
        this.$customization.preloadTextPlaceholderSettings().then((settings) => {
          this.applyAuditTextPlaceholderSettings(settings);
          if (this.detailsWasEmptyOnLoad &&
            (!this.localAnalysisDetails || this.localAnalysisDetails.trim() === '' || this.localAnalysisDetails === this.$t('audit.details_instruction'))) {
            this.localAnalysisDetails = this.analysisDetailsInstructionText;
          }
        }).catch(() => {
          // Keep fallback placeholders if loading customization fails.
        });
      }
    },
    resolveVulnAliases: function (aliases, vulnSource) {
      return common.resolveVulnAliases(
        vulnSource ? vulnSource : this.source,
        aliases,
      );
    },
    lookupRiskEntry: function (likelihood, impact) {
      if (!likelihood || !impact) {
        return null;
      }
      // Use custom matrix when admin has enabled it
      if (this.customMatrix && this.customMatrix.enabled) {
        const cellKey = likelihood + '::' + impact;
        const cell = this.customMatrix.cells[cellKey];
        if (cell) {
          const level = this.customMatrix.levels.find((l) => l.key === cell.levelKey);
          if (level) {
            return {
              rating: level.key,
              action: cell.action,
              color: level.color,
              textColor: contrastTextColor(level.color),
              ratingText: level.label,
              actionText: cell.action,
            };
          }
        }
        return null;
      }
      // Fallback: hardcoded matrix (default behaviour, no regression)
      const likelihoodRow = RISK_MATRIX_TABLE[likelihood];
      if (!likelihoodRow) {
        return null;
      }
      const entry = likelihoodRow[impact];
      if (!entry) {
        return null;
      }
      return {
        ...entry,
        textColor: contrastTextColor(entry.color),
        ratingText: this.$t(`riskMatrix.ratings.${entry.rating}`),
        actionText: this.$t(`riskMatrix.actions.${entry.action}`),
      };
    },
    getAnalysis: function () {
      let queryString =
        '?project=' +
        this.projectUuid +
        '&component=' +
        this.finding.component.uuid +
        '&vulnerability=' +
        this.finding.vulnerability.uuid;
      let url = `${this.$api.BASE_URL}/${this.$api.URL_ANALYSIS}` + queryString;
      this.axios
        .get(url, {
          validateStatus: (status) => status === 200 || status === 404,
        })
        .then((response) => {
          this.updateAnalysisData(response.data);
        });
    },
    updateAnalysisData: function (analysis) {
      if (Object.prototype.hasOwnProperty.call(analysis, 'analysisComments')) {
        let trail = '';
        for (let i = 0; i < analysis.analysisComments.length; i++) {
          if (
            Object.prototype.hasOwnProperty.call(
              analysis.analysisComments[i],
              'commenter',
            )
          ) {
            trail += analysis.analysisComments[i].commenter + ' - ';
          }
          trail += common.formatTimestamp(
            analysis.analysisComments[i].timestamp,
            true,
          );
          trail += '\n';
          trail += analysis.analysisComments[i].comment;
          trail += '\n\n';
        }
        this.auditTrail = trail;
      }
      if (Object.prototype.hasOwnProperty.call(analysis, 'analysisState')) {
        this.analysisState = analysis.analysisState;
      }
      if (
        Object.prototype.hasOwnProperty.call(analysis, 'analysisJustification')
      ) {
        this.analysisJustification = analysis.analysisJustification;
      }
      if (Object.prototype.hasOwnProperty.call(analysis, 'analysisResponse')) {
        this.analysisResponse = analysis.analysisResponse;
      }
      if (Object.prototype.hasOwnProperty.call(analysis, 'riskImpact')) {
        this.selectedImpact = analysis.riskImpact;
      }
      if (Object.prototype.hasOwnProperty.call(analysis, 'riskLikelihood')) {
        this.selectedLikelihood = analysis.riskLikelihood;
      }
      if (
        Object.prototype.hasOwnProperty.call(analysis, 'residualRiskImpact')
      ) {
        this.residualImpact = analysis.residualRiskImpact;
      }
      if (
        Object.prototype.hasOwnProperty.call(
          analysis,
          'residualRiskLikelihood',
        )
      ) {
        this.residualLikelihood = analysis.residualRiskLikelihood;
      }
      if (Object.prototype.hasOwnProperty.call(analysis, 'riskJustification')) {
        this.riskJustification = analysis.riskJustification;
      }
      if (Object.prototype.hasOwnProperty.call(analysis, 'residualRiskJustification')) {
        this.residualRiskJustification = analysis.residualRiskJustification;
      }
      if (Object.prototype.hasOwnProperty.call(analysis, 'analysisDetails')) {
        this.analysisDetails = analysis.analysisDetails;
      }
      // Use a boolean sentinel to track whether details were empty on load
      this.detailsWasEmptyOnLoad = !this.analysisDetails || this.analysisDetails === '';
      if (this.detailsWasEmptyOnLoad) {
        this.localAnalysisDetails = this.analysisDetailsInstructionText;
      } else {
        this.localAnalysisDetails = this.analysisDetails;
      }
      if (Object.prototype.hasOwnProperty.call(analysis, 'isSuppressed')) {
        this.isSuppressed = analysis.isSuppressed;
      } else {
        this.isSuppressed = false;
      }
    },
    makeAnalysis: function () {
      const i18nParams = {
        impact: this.axisImpactLabel,
        likelihood: this.axisLikelihoodLabel,
      };

      if (this.customMatrix?.requireRiskAssessment) {
        if (!this.selectedImpact || !this.selectedLikelihood) {
          this.$toastr.w(this.$t('riskMatrix.riskAssessmentRequired', { ...i18nParams, section: this.riskAssessmentTitle }));
          return;
        }
      }
      // Justification required whenever impact + likelihood are both selected
      if (this.selectedImpact && this.selectedLikelihood) {
        if (!this.riskJustification || !this.riskJustification.trim()) {
          this.$toastr.w(this.$t('riskMatrix.justificationRequired', { section: this.riskAssessmentTitle }));
          return;
        }
      }
      if (this.customMatrix?.requireResidualRiskAssessment) {
        if (!this.residualImpact || !this.residualLikelihood) {
          this.$toastr.w(this.$t('riskMatrix.residualRiskAssessmentRequired', { ...i18nParams, section: this.residualRiskTitle }));
          return;
        }
      }
      // Justification required whenever residual impact + likelihood are both selected
      if (this.residualImpact && this.residualLikelihood) {
        if (!this.residualRiskJustification || !this.residualRiskJustification.trim()) {
          this.$toastr.w(this.$t('riskMatrix.justificationRequired', { section: this.residualRiskTitle }));
          return;
        }
      }
      // Determine what to send for details
      let detailsToSend = null;

      // Case 1: User has edited the instruction or provided new content
      if (this.localAnalysisDetails &&
          this.localAnalysisDetails.trim() !== '' &&
          this.localAnalysisDetails !== this.analysisDetailsInstructionText) {
        // User wrote something different from the instruction = send it
        detailsToSend = this.localAnalysisDetails;
      }
      // Case 2: Details were NOT empty on load (preserve existing saved content)
      else if (!this.detailsWasEmptyOnLoad && this.localAnalysisDetails) {
        // There was already saved content = preserve it
        detailsToSend = this.localAnalysisDetails;
      }
      // Case 3: Instruction text is unchanged = send null (don't persist instruction)

      this.callRestEndpoint(
        this.analysisState,
        this.analysisJustification,
        this.analysisResponse,
        detailsToSend,
        null,
        null,
      );
    },
    addComment: function () {
      if (this.comment != null) {
        // When adding a comment, use the same logic to determine what details to send
        let detailsToSendForComment = null;

        if (this.localAnalysisDetails &&
            this.localAnalysisDetails.trim() !== '' &&
            this.localAnalysisDetails !== this.analysisDetailsInstructionText) {
          detailsToSendForComment = this.localAnalysisDetails;
        } else if (!this.detailsWasEmptyOnLoad && this.localAnalysisDetails) {
          detailsToSendForComment = this.localAnalysisDetails;
        }

        this.callRestEndpoint(
          this.analysisState,
          this.analysisJustification,
          this.analysisResponse,
          detailsToSendForComment,
          this.comment,
          null,
        );
      }
      this.comment = null;
    },
    severityFromRiskLevel(rating) {
      const VALID_SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];
      const POSITION_MAP = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      if (!rating) return 'UNASSIGNED';
      const key = rating.toUpperCase();
      if (VALID_SEVERITIES.includes(key)) return key;
      if (key === 'VERY_LOW') return 'LOW';
      if (this.customMatrix?.levels) {
        const sorted = [...this.customMatrix.levels].sort((a, b) => a.sortOrder - b.sortOrder);
        const idx = sorted.findIndex((l) => l.key === key);
        if (idx !== -1) {
          const pos = Math.floor((idx / sorted.length) * POSITION_MAP.length);
          return POSITION_MAP[Math.min(pos, POSITION_MAP.length - 1)];
        }
      }
      return 'LOW';
    },
    updateVulnerabilitySeverity() {
      if (!this.customMatrix?.enabled || this.finding.vulnerability.source !== 'INTERNAL') return;
      let severity;
      if (this.residualImpact && this.residualLikelihood && this.residualCalculatedRisk) {
        severity = this.severityFromRiskLevel(this.residualCalculatedRisk.rating);
      } else if (this.selectedImpact && this.selectedLikelihood && this.calculatedRisk) {
        severity = this.severityFromRiskLevel(this.calculatedRisk.rating);
      } else {
        severity = 'UNASSIGNED';
      }
      const vuln = this.finding.vulnerability;
      const getUrl = `${this.$api.BASE_URL}/${this.$api.URL_VULNERABILITY}/${vuln.uuid}`;
      const postUrl = `${this.$api.BASE_URL}/${this.$api.URL_VULNERABILITY}`;
      // Fetch the full vulnerability first so we don't accidentally clear fields
      // (created, published, updated, detail, references) that are absent from the Finding response.
      this.axios
        .get(getUrl)
        .then((response) => {
          const { normalizedCvssV2Vector, affectedProjectCount, affectedActiveProjectCount, affectedInactiveProjectCount, findingAttribution, ...vulnData } = response.data;
          return this.axios.post(postUrl, { ...vulnData, severity });
        })
        .then(() => {
          this.finding.vulnerability.severity = severity;
          if (this.onSeverityUpdated) {
            this.onSeverityUpdated();
          }
        })
        .catch((error) => {
          const status = error?.response?.status;
          if (status === 401 || status === 403) {
            // User doesn't have VULNERABILITY_MANAGEMENT permission — silently skip
            return;
          }
          this.$toastr.w(this.$t('condition.unsuccessful_action') + (status ? ` (${status})` : ''));
        });
    },
    callRestEndpoint: function (
      analysisState,
      analysisJustification,
      analysisResponse,
      analysisDetails,
      comment,
      isSuppressed,
    ) {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_ANALYSIS}`;
      this.axios
        .put(url, {
          project: this.projectUuid,
          component: this.finding.component.uuid,
          vulnerability: this.finding.vulnerability.uuid,
          analysisState: analysisState,
          analysisJustification: analysisJustification,
          analysisResponse: analysisResponse,
          analysisDetails: analysisDetails,
          // risk matrix fields
          riskImpact: this.selectedImpact,
          riskLikelihood: this.selectedLikelihood,
          residualRiskImpact: this.residualImpact,
          residualRiskLikelihood: this.residualLikelihood,
          riskJustification: this.riskJustification,
          residualRiskJustification: this.residualRiskJustification,
          comment: comment,
          isSuppressed: isSuppressed,
        })
        .then((response) => {
          this.$toastr.s(this.$t('message.updated'));
          this.updateAnalysisData(response.data);
          this.updateVulnerabilitySeverity();
        })
        .catch(() => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
    },
  },
  beforeMount() {
    this.finding && this.getAnalysis();
  },

  created() {
    this.loadAuditTextPlaceholderSettings();
    // Apply custom risk matrix if configured by admin.
    // Use preloadRiskMatrixConfig() (not getCachedRiskMatrixConfig) so that:
    // - if already cached it resolves instantly from memory
    // - if cache was invalidated (admin just saved) it reloads from backend
    if (this.$customization && this.$customization.preloadRiskMatrixConfig) {
      this.$customization.preloadRiskMatrixConfig().then((matrixConfig) => {
        if (matrixConfig && matrixConfig.enabled) {
          this.customMatrix = matrixConfig;
          this.riskImpactChoices = matrixConfig.impactValues
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((v) => ({ value: v.key, text: v.label }));
          this.riskLikelihoodChoices = matrixConfig.likelihoodValues
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((v) => ({ value: v.key, text: v.label }));
        }
      });
    }
    // Fallback: ensure localAnalysisDetails contains the instruction so the UI shows guidance
    if (!this.localAnalysisDetails) {
      try {
        this.localAnalysisDetails = this.analysisDetailsInstructionText;
      } catch (e) {
        // ignore i18n errors in environments where $t may not be available yet
      }
    }
  },
  components: {
    BootstrapToggle,
  },
};
</script>

<style scoped>
.calculated-risk-field {
  min-height: 38px;
  border: 1px solid #495057;
  border-radius: 0.25rem;
  padding: 0.375rem 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.calculated-risk-empty {
  color: #adb5bd;
  background-color: transparent;
}

.risk-matrix-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.risk-matrix-field {
  flex: 1 1 0;
  min-width: 12rem;
}

.risk-matrix-label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 600;
}

</style>
