<template>
  <div class="risk-matrix-admin">
    <b-form-group class="mb-3">
      <b-form-checkbox v-model="draft.enabled" @change="onToggleCustomMatrix">
        {{ $t('riskMatrix.enableCustom') }}
      </b-form-checkbox>
      <small class="text-muted d-block mt-1">{{ $t('riskMatrix.enableCustomHelp') }}</small>
    </b-form-group>

    <b-card class="mb-3" no-body>
      <div class="matrix-card-header">{{ $t('riskMatrix.sectionLabelsTitle') }}</div>
      <div class="matrix-card-body">
        <b-row>
          <b-col sm="6" class="d-flex align-items-center mb-2 mb-sm-0">
            <template v-if="editingRiskAssessmentLabel">
              <b-form-input
                ref="riskAssessmentLabelInput"
                v-model="draft.sectionLabels.riskAssessment"
                size="sm"
                class="inline-label-input"
                :placeholder="$t('riskMatrix.title')"
                maxlength="60"
                :disabled="!draft.enabled"
                @blur="editingRiskAssessmentLabel = false; isDirty = true"
                @keyup.enter="editingRiskAssessmentLabel = false; isDirty = true"
                @keyup.esc="editingRiskAssessmentLabel = false"
              />
            </template>
            <template v-else>
              <span class="mr-1">{{ riskAssessmentLabel }}</span>
              <b-button
                v-if="draft.enabled"
                size="sm"
                variant="link"
                class="p-0 inline-edit-btn"
                @click="editingRiskAssessmentLabel = true; $nextTick(() => $refs.riskAssessmentLabelInput && $refs.riskAssessmentLabelInput.focus())"
              >
                <i class="fa fa-pencil fa-sm"></i>
              </b-button>
            </template>
          </b-col>
          <b-col sm="6" class="d-flex align-items-center">
            <template v-if="editingResidualRiskLabel">
              <b-form-input
                ref="residualRiskLabelInput"
                v-model="draft.sectionLabels.residualRisk"
                size="sm"
                class="inline-label-input"
                :placeholder="$t('riskMatrix.residualTitle')"
                maxlength="60"
                :disabled="!draft.enabled"
                @blur="editingResidualRiskLabel = false; isDirty = true"
                @keyup.enter="editingResidualRiskLabel = false; isDirty = true"
                @keyup.esc="editingResidualRiskLabel = false"
              />
            </template>
            <template v-else>
              <span class="mr-1">{{ residualRiskLabel }}</span>
              <b-button
                v-if="draft.enabled"
                size="sm"
                variant="link"
                class="p-0 inline-edit-btn"
                @click="editingResidualRiskLabel = true; $nextTick(() => $refs.residualRiskLabelInput && $refs.residualRiskLabelInput.focus())"
              >
                <i class="fa fa-pencil fa-sm"></i>
              </b-button>
            </template>
          </b-col>
        </b-row>
        <b-row class="mt-3">
          <b-col sm="6">
            <b-form-checkbox v-model="draft.requireRiskAssessment" :disabled="!draft.enabled" @change="isDirty = true">
              {{ $t('riskMatrix.requireRiskAssessment') }}
            </b-form-checkbox>
          </b-col>
          <b-col sm="6">
            <b-form-checkbox v-model="draft.requireResidualRiskAssessment" :disabled="!draft.enabled" @change="isDirty = true">
              {{ $t('riskMatrix.requireResidualRiskAssessment') }}
            </b-form-checkbox>
          </b-col>
        </b-row>
      </div>
    </b-card>

    <b-row>
      <b-col lg="4" class="mb-3">
        <b-card class="h-100" no-body>
          <div class="matrix-card-header d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center flex-grow-1 mr-2" style="min-width:0">
              <template v-if="editingImpactLabel">
                <b-form-input
                  ref="impactLabelInput"
                  v-model="draft.axisLabels.impact"
                  size="sm"
                  class="inline-label-input"
                  :placeholder="$t('riskMatrix.impact')"
                  maxlength="40"
                  @blur="editingImpactLabel = false; isDirty = true"
                  @keyup.enter="editingImpactLabel = false; isDirty = true"
                  @keyup.esc="editingImpactLabel = false"
                />
              </template>
              <template v-else>
                <span class="mr-1">{{ axisImpactLabel }}</span>
                <b-button
                  v-if="draft.enabled"
                  size="sm"
                  variant="link"
                  class="p-0 inline-edit-btn"
                  @click="editingImpactLabel = true; $nextTick(() => $refs.impactLabelInput && $refs.impactLabelInput.focus())"
                >
                  <i class="fa fa-pencil fa-sm"></i>
                </b-button>
              </template>
            </div>
            <b-badge variant="secondary">{{ $t('riskMatrix.columns') }}</b-badge>
          </div>
          <div class="matrix-card-body">
            <div
              v-for="item in draft.impactValues"
              :key="item.key"
              class="matrix-list-row d-flex align-items-center"
            >
              <span class="row-index">{{ item.sortOrder }}</span>
              <span class="flex-grow-1">{{ item.label }}</span>
              <b-button size="sm" variant="link" :disabled="!draft.enabled" @click="openValueModal('impact', item)">
                <i class="fa fa-pencil"></i>
              </b-button>
              <b-button size="sm" variant="link" :disabled="!draft.enabled" @click="removeValue('impact', item.key)">
                <i class="fa fa-trash"></i>
              </b-button>
            </div>
            <b-button size="sm" variant="outline-primary" class="mt-2" :disabled="!draft.enabled" @click="openValueModal('impact')">
              <i class="fa fa-plus"></i> {{ $t('riskMatrix.addItem') }}
            </b-button>
          </div>
        </b-card>
      </b-col>

      <b-col lg="4" class="mb-3">
        <b-card class="h-100" no-body>
          <div class="matrix-card-header d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center flex-grow-1 mr-2" style="min-width:0">
              <template v-if="editingLikelihoodLabel">
                <b-form-input
                  ref="likelihoodLabelInput"
                  v-model="draft.axisLabels.likelihood"
                  size="sm"
                  class="inline-label-input"
                  :placeholder="$t('riskMatrix.likelihood')"
                  maxlength="40"
                  @blur="editingLikelihoodLabel = false; isDirty = true"
                  @keyup.enter="editingLikelihoodLabel = false; isDirty = true"
                  @keyup.esc="editingLikelihoodLabel = false"
                />
              </template>
              <template v-else>
                <span class="mr-1">{{ axisLikelihoodLabel }}</span>
                <b-button
                  v-if="draft.enabled"
                  size="sm"
                  variant="link"
                  class="p-0 inline-edit-btn"
                  @click="editingLikelihoodLabel = true; $nextTick(() => $refs.likelihoodLabelInput && $refs.likelihoodLabelInput.focus())"
                >
                  <i class="fa fa-pencil fa-sm"></i>
                </b-button>
              </template>
            </div>
            <b-badge variant="secondary">{{ $t('riskMatrix.rows') }}</b-badge>
          </div>
          <div class="matrix-card-body">
            <div
              v-for="item in draft.likelihoodValues"
              :key="item.key"
              class="matrix-list-row d-flex align-items-center"
            >
              <span class="row-index">{{ item.sortOrder }}</span>
              <span class="flex-grow-1">{{ item.label }}</span>
              <b-button size="sm" variant="link" :disabled="!draft.enabled" @click="openValueModal('likelihood', item)">
                <i class="fa fa-pencil"></i>
              </b-button>
              <b-button size="sm" variant="link" :disabled="!draft.enabled" @click="removeValue('likelihood', item.key)">
                <i class="fa fa-trash"></i>
              </b-button>
            </div>
            <b-button size="sm" variant="outline-primary" class="mt-2" :disabled="!draft.enabled" @click="openValueModal('likelihood')">
              <i class="fa fa-plus"></i> {{ $t('riskMatrix.addItem') }}
            </b-button>
          </div>
        </b-card>
      </b-col>

      <b-col lg="4" class="mb-3">
        <b-card class="h-100" no-body>
          <div class="matrix-card-header d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center flex-grow-1 mr-2" style="min-width:0">
              <template v-if="editingLevelLabel">
                <b-form-input
                  ref="levelLabelInput"
                  v-model="draft.levelDefinitionsLabel"
                  size="sm"
                  class="inline-label-input"
                  :placeholder="$t('riskMatrix.levelDefinitions')"
                  maxlength="40"
                  @blur="editingLevelLabel = false; isDirty = true"
                  @keyup.enter="editingLevelLabel = false; isDirty = true"
                  @keyup.esc="editingLevelLabel = false"
                />
              </template>
              <template v-else>
                <span class="mr-1">{{ levelLabel }}</span>
                <b-button
                  v-if="draft.enabled"
                  size="sm"
                  variant="link"
                  class="p-0 inline-edit-btn"
                  @click="editingLevelLabel = true; $nextTick(() => $refs.levelLabelInput && $refs.levelLabelInput.focus())"
                >
                  <i class="fa fa-pencil fa-sm"></i>
                </b-button>
              </template>
            </div>
            <b-badge variant="secondary" class="ml-2 text-nowrap">
              {{ $t('riskMatrix.owaspSeverityMapping') }}
            </b-badge>
          </div>
          <div class="matrix-card-body">
            <div
              v-for="level in draft.levels"
              :key="level.key"
              class="matrix-list-row d-flex align-items-center"
            >
              <span class="color-dot" :style="{ backgroundColor: level.color }"></span>
              <span class="flex-grow-1">{{ level.label }}</span>
              <b-badge variant="secondary" class="mr-2">
                {{ mappedSeverityLabel(level) }}
              </b-badge>
              <b-button size="sm" variant="link" :disabled="!draft.enabled" @click="openLevelModal(level)">
                <i class="fa fa-pencil"></i>
              </b-button>
              <b-button
                size="sm"
                variant="link"
                :disabled="!draft.enabled || usedLevelKeys.has(level.key)"
                @click="removeLevel(level.key)"
              >
                <i class="fa fa-trash"></i>
              </b-button>
            </div>
            <b-button size="sm" variant="outline-primary" class="mt-2" :disabled="!draft.enabled" @click="openLevelModal()">
              <i class="fa fa-plus"></i> {{ $t('riskMatrix.addLevel') }}
            </b-button>
          </div>
        </b-card>
      </b-col>
    </b-row>

    <b-card class="mb-3 risk-mapping-card" no-body>
      <div class="matrix-card-header d-flex justify-content-between align-items-center">
        <span>{{ $t('riskMatrix.mappingTitle') }}</span>
        <b-badge variant="secondary">{{ $t('riskMatrix.grid') }}</b-badge>
      </div>
      <div class="matrix-card-body">
        <div class="matrix-tools d-flex align-items-center mb-3">
          <b-button size="sm" variant="outline-primary" class="mr-2" :disabled="!draft.enabled" @click="quickFill">
            <i class="fa fa-magic"></i> {{ $t('riskMatrix.quickFill') }}
          </b-button>
          <small class="text-muted">{{ draft.enabled ? $t('riskMatrix.clickCellToEdit') : $t('riskMatrix.enableCustomToEdit') }}</small>
        </div>
        <div class="table-responsive">
          <table class="table table-sm mb-0 matrix-grid">
            <thead>
              <tr>
                <th class="matrix-corner">
                  <div class="matrix-axis-title">{{ axisImpactLabel }} &#8594;</div>
                  <div class="matrix-axis-title">/ {{ axisLikelihoodLabel }} &#8595;</div>
                </th>
                <th
                  v-for="impact in sortedImpactValues"
                  :key="impact.key"
                  class="matrix-col-header"
                >
                  <div class="matrix-col-label">{{ impact.label }}</div>
                  <span class="matrix-col-index">{{ impact.sortOrder }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="likelihood in sortedLikelihoodValues" :key="likelihood.key">
                <th class="matrix-row-header">
                  <span class="matrix-row-index">{{ likelihood.sortOrder }}</span>
                  <span class="matrix-row-label">{{ likelihood.label }}</span>
                </th>
                <td
                  v-for="impact in sortedImpactValues"
                  :key="`${likelihood.key}-${impact.key}`"
                  class="matrix-cell-display"
                  :class="{ 'matrix-cell-display--disabled': !draft.enabled }"
                  :style="getCellBackgroundStyle(likelihood.key, impact.key)"
                  @click="openCellModal(likelihood, impact)"
                >
                  <div class="matrix-level-title">
                    {{ getCellDisplay(likelihood.key, impact.key).levelLabel }}
                  </div>
                  <div class="matrix-action-label">
                    {{ getCellDisplay(likelihood.key, impact.key).actionLabel }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </b-card>

    <div class="matrix-footer text-right">
      <b-button variant="outline-primary" class="px-4" @click="saveSettings">
        {{ $t('message.update') }}
      </b-button>
    </div>

    <b-modal
      id="riskMatrixCellModal"
      :title="$t('riskMatrix.editCellTitle')"
      @hide="resetCellModal"
    >
      <p class="text-muted mb-2">
        {{ cellModal.likelihoodLabel }} x {{ cellModal.impactLabel }}
      </p>
      <b-form-group :label="$t('riskMatrix.levelDefinitions')">
        <b-form-select v-model="cellModal.levelKey" :options="levelOptions" />
      </b-form-group>
      <b-form-group :label="$t('riskMatrix.actionLabel')">
        <b-form-input
          v-model="cellModal.action"
          :placeholder="$t('riskMatrix.actionPlaceholder')"
          maxlength="120"
        />
      </b-form-group>
      <template v-slot:modal-footer="{ cancel }">
        <b-button size="sm" variant="secondary" @click="cancel()">{{ $t('message.cancel') }}</b-button>
        <b-button size="sm" variant="primary" :disabled="!draft.enabled" @click="saveCellModal">{{ $t('message.save') }}</b-button>
      </template>
    </b-modal>

    <b-modal
      id="riskMatrixValueModal"
      :title="valueModalMode === 'create' ? $t('message.add') : $t('message.update')"
      @hide="resetValueModal"
    >
      <b-form-group :label="$t('admin.severity_level_label')">
        <b-form-input v-model="valueModal.label" />
      </b-form-group>
      <template v-slot:modal-footer="{ cancel }">
        <b-button size="sm" variant="secondary" @click="cancel()">{{ $t('message.cancel') }}</b-button>
        <b-button size="sm" variant="primary" @click="saveValueModal">{{ $t('message.save') }}</b-button>
      </template>
    </b-modal>

    <b-modal
      id="riskMatrixLevelModal"
      :title="levelModalMode === 'create' ? $t('riskMatrix.addLevel') : $t('riskMatrix.editLevel')"
      @hide="resetLevelModal"
    >
      <b-form-group :label="$t('admin.severity_level_label')">
        <b-form-input v-model="levelModal.label" />
      </b-form-group>
      <b-form-group :label="$t('admin.severity_level_color')">
        <div class="d-flex align-items-center">
          <b-form-input
            v-model="levelModal.color"
            type="color"
            style="width:100px;height:38px"
          />
          <span class="ml-2">{{ levelModal.color }}</span>
        </div>
      </b-form-group>
      <b-form-group :label="$t('riskMatrix.owaspSeverityMapping')" :description="$t('riskMatrix.owaspSeverityMappingDesc')">
        <b-form-select v-model="levelModal.owaspSeverityMapping" :options="owaspSeverityOptions" />
      </b-form-group>
      <b-form-group :label="$t('riskMatrix.levelAction')">
        <b-form-input v-model="levelModal.action" :placeholder="$t('riskMatrix.levelActionPlaceholder')" />
      </b-form-group>
      <template v-slot:modal-footer="{ cancel }">
        <b-button size="sm" variant="secondary" @click="cancel()">{{ $t('message.cancel') }}</b-button>
        <b-button size="sm" variant="primary" @click="saveLevelModal">{{ $t('message.save') }}</b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import { contrastTextColor } from '@/shared/colorUtils';

const DEFAULT_ACTION_BY_LEVEL = {
  VERY_LOW: 'Accept',
  LOW: 'Monitor',
  MEDIUM: 'Monitor & Plan',
  HIGH: 'Mitigate',
  CRITICAL: 'Mitigate Immediately',
};

const LEGACY_ACTION_TO_TEXT = {
  ACCEPT: 'Accept',
  MONITOR: 'Monitor',
  MONITOR_PLAN: 'Monitor & Plan',
  MITIGATE: 'Mitigate',
  MITIGATE_IMMEDIATELY: 'Mitigate Immediately',
};

const LEVEL_COLOR_MAP = {
  VERY_LOW: '#4CAF50',
  LOW: '#8BC34A',
  MEDIUM: '#FF9800',
  HIGH: '#f44336',
  CRITICAL: '#D32F2F',
};

const DEFAULT_MATRIX = {
  VIRTUALLY_IMPOSSIBLE: {
    LOW: { levelKey: 'VERY_LOW', action: 'Accept' },
    MEDIUM: { levelKey: 'VERY_LOW', action: 'Accept' },
    HIGH: { levelKey: 'LOW', action: 'Monitor' },
    CRITICAL: { levelKey: 'LOW', action: 'Monitor' },
  },
  UNLIKELY: {
    LOW: { levelKey: 'VERY_LOW', action: 'Accept' },
    MEDIUM: { levelKey: 'LOW', action: 'Monitor' },
    HIGH: { levelKey: 'MEDIUM', action: 'Monitor & Plan' },
    CRITICAL: { levelKey: 'HIGH', action: 'Mitigate' },
  },
  POSSIBLE: {
    LOW: { levelKey: 'LOW', action: 'Monitor' },
    MEDIUM: { levelKey: 'MEDIUM', action: 'Monitor & Plan' },
    HIGH: { levelKey: 'HIGH', action: 'Mitigate' },
    CRITICAL: { levelKey: 'CRITICAL', action: 'Mitigate Immediately' },
  },
  LIKELY: {
    LOW: { levelKey: 'LOW', action: 'Monitor' },
    MEDIUM: { levelKey: 'HIGH', action: 'Mitigate' },
    HIGH: { levelKey: 'HIGH', action: 'Mitigate' },
    CRITICAL: { levelKey: 'CRITICAL', action: 'Mitigate Immediately' },
  },
  ALMOST_CERTAIN: {
    LOW: { levelKey: 'LOW', action: 'Monitor' },
    MEDIUM: { levelKey: 'HIGH', action: 'Mitigate' },
    HIGH: { levelKey: 'CRITICAL', action: 'Mitigate Immediately' },
    CRITICAL: { levelKey: 'CRITICAL', action: 'Mitigate Immediately' },
  },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function defaultAction(levelKey) {
  return DEFAULT_ACTION_BY_LEVEL[levelKey] || 'Monitor';
}

function normalizeActionText(action, levelKey) {
  const text = String(action || '').trim();
  if (!text) {
    return defaultAction(levelKey);
  }
  const legacyText = LEGACY_ACTION_TO_TEXT[text.toUpperCase()];
  return legacyText || text;
}

function createDefaultDraft() {
  const impactValues = [
    { key: 'LOW', label: 'Low', sortOrder: 1 },
    { key: 'MEDIUM', label: 'Medium', sortOrder: 2 },
    { key: 'HIGH', label: 'High', sortOrder: 3 },
    { key: 'CRITICAL', label: 'Critical', sortOrder: 4 },
  ];
  const likelihoodValues = [
    { key: 'VIRTUALLY_IMPOSSIBLE', label: 'Virtually Impossible', sortOrder: 1 },
    { key: 'UNLIKELY', label: 'Unlikely', sortOrder: 2 },
    { key: 'POSSIBLE', label: 'Possible', sortOrder: 3 },
    { key: 'LIKELY', label: 'Likely', sortOrder: 4 },
    { key: 'ALMOST_CERTAIN', label: 'Almost Certain', sortOrder: 5 },
  ];
  const levels = [
    { key: 'VERY_LOW', label: 'Very Low', color: '#4CAF50', owaspSeverityMapping: 'LOW', action: 'Accept', sortOrder: 1 },
    { key: 'LOW', label: 'Low', color: '#8BC34A', owaspSeverityMapping: 'LOW', action: 'Monitor', sortOrder: 2 },
    { key: 'MEDIUM', label: 'Medium', color: '#FF9800', owaspSeverityMapping: 'MEDIUM', action: 'Monitor & Plan', sortOrder: 3 },
    { key: 'HIGH', label: 'High', color: '#f44336', owaspSeverityMapping: 'HIGH', action: 'Mitigate', sortOrder: 4 },
    { key: 'CRITICAL', label: 'Critical', color: '#D32F2F', owaspSeverityMapping: 'CRITICAL', action: 'Mitigate Immediately', sortOrder: 5 },
  ];

  const cells = {};
  likelihoodValues.forEach((likelihood) => {
    impactValues.forEach((impact) => {
      const key = `${likelihood.key}::${impact.key}`;
      const defaultCell = DEFAULT_MATRIX[likelihood.key][impact.key];
      cells[key] = {
        levelKey: defaultCell.levelKey,
        action: defaultCell.action,
      };
    });
  });

  return {
    enabled: false,
    axisLabels: {
      impact: 'Impact',
      likelihood: 'Likelihood',
    },
    levelDefinitionsLabel: 'Calculated Risk',
    sectionLabels: {
      riskAssessment: 'Risk Assessment',
      residualRisk: 'Residual Risk Assessment',
    },
    requireRiskAssessment: false,
    requireResidualRiskAssessment: false,
    impactValues,
    likelihoodValues,
    levels,
    cells,
  };
}

export default {
  name: 'RiskMatrix',
  data() {
    return {
      draft: createDefaultDraft(),
      isDirty: false,
      editingImpactLabel: false,
      editingLikelihoodLabel: false,
      editingLevelLabel: false,
      editingRiskAssessmentLabel: false,
      editingResidualRiskLabel: false,
      valueModalMode: 'create',
      valueModalType: 'impact',
      valueModal: { originalKey: null, key: '', label: '' },
      levelModalMode: 'create',
      levelModal: { originalKey: null, key: '', label: '', color: '#32c766', owaspSeverityMapping: 'UNASSIGNED', action: '' },
      cellModal: {
        likelihoodKey: null,
        likelihoodLabel: '',
        impactKey: null,
        impactLabel: '',
        levelKey: null,
        action: null,
      },
    };
  },
  computed: {
    sortedImpactValues() {
      return [...this.draft.impactValues].sort((a, b) => a.sortOrder - b.sortOrder);
    },
    sortedLikelihoodValues() {
      return [...this.draft.likelihoodValues].sort((a, b) => a.sortOrder - b.sortOrder);
    },
    axisImpactLabel() {
      const label = String(this.draft?.axisLabels?.impact || '').trim();
      return label || this.$t('riskMatrix.impact');
    },
    axisLikelihoodLabel() {
      const label = String(this.draft?.axisLabels?.likelihood || '').trim();
      return label || this.$t('riskMatrix.likelihood');
    },
    levelLabel() {
      const label = String(this.draft?.levelDefinitionsLabel || '').trim();
      return label || this.$t('riskMatrix.levelDefinitions');
    },
    riskAssessmentLabel() {
      const label = String(this.draft?.sectionLabels?.riskAssessment || '').trim();
      return label || this.$t('riskMatrix.title');
    },
    residualRiskLabel() {
      const label = String(this.draft?.sectionLabels?.residualRisk || '').trim();
      return label || this.$t('riskMatrix.residualTitle');
    },
    levelOptions() {
      return this.draft.levels
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((level) => ({ value: level.key, text: level.label }));
    },
    owaspSeverityOptions() {
      return [
        { value: 'CRITICAL',   text: this.$t('severity.critical') },
        { value: 'HIGH',       text: this.$t('severity.high') },
        { value: 'MEDIUM',     text: this.$t('severity.medium') },
        { value: 'LOW',        text: this.$t('severity.low') },
        { value: 'INFO',       text: this.$t('severity.info') },
        { value: 'UNASSIGNED', text: this.$t('severity.unassigned') },
      ];
    },
    levelMap() {
      return this.draft.levels.reduce((acc, level) => {
        acc[level.key] = level;
        return acc;
      }, {});
    },
    usedLevelKeys() {
      const used = new Set();
      Object.values(this.draft.cells).forEach((cell) => {
        if (cell && cell.levelKey) {
          used.add(cell.levelKey);
        }
      });
      return used;
    },
  },
  watch: {
    'valueModal.label'(val) {
      if (this.valueModalMode === 'create') {
        this.valueModal.key = val.trim().toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
      }
    },
    'levelModal.label'(val) {
      if (this.levelModalMode === 'create') {
        this.levelModal.key = val.trim().toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
      }
    },
  },
  methods: {
    async loadSettings() {
      let loaded = null;
      if (this.$customization && this.$customization.getRiskMatrixSettings) {
        try {
          const response = await this.$customization.getRiskMatrixSettings();
          if (response && response.data) {
            loaded = response.data;
          }
        } catch (e) {
          // Use defaults if settings endpoint is unavailable.
        }
      }

      if (!loaded) {
        loaded = createDefaultDraft();
      }

      this.draft = this.normalizeDraft(loaded);
      this.isDirty = false;
    },
    normalizeDraft(input) {
      const fallback = createDefaultDraft();
      const normalized = {
        enabled: input?.enabled === true,
        axisLabels: {
          impact: String(input?.axisLabels?.impact || fallback.axisLabels.impact || '').trim(),
          likelihood: String(input?.axisLabels?.likelihood || fallback.axisLabels.likelihood || '').trim(),
        },
        levelDefinitionsLabel: String(input?.levelDefinitionsLabel || fallback.levelDefinitionsLabel || '').trim(),
        sectionLabels: {
          riskAssessment: String(input?.sectionLabels?.riskAssessment || fallback.sectionLabels.riskAssessment || '').trim(),
          residualRisk: String(input?.sectionLabels?.residualRisk || fallback.sectionLabels.residualRisk || '').trim(),
        },
        requireRiskAssessment: input?.requireRiskAssessment === true,
        requireResidualRiskAssessment: input?.requireResidualRiskAssessment === true,
        impactValues: Array.isArray(input?.impactValues) && input.impactValues.length > 0 ? input.impactValues : fallback.impactValues,
        likelihoodValues: Array.isArray(input?.likelihoodValues) && input.likelihoodValues.length > 0 ? input.likelihoodValues : fallback.likelihoodValues,
        levels: Array.isArray(input?.levels) && input.levels.length > 0 ? input.levels : fallback.levels,
        cells: input?.cells && typeof input.cells === 'object' ? input.cells : {},
      };

      if (!normalized.axisLabels.impact) {
        normalized.axisLabels.impact = fallback.axisLabels.impact;
      }
      if (!normalized.axisLabels.likelihood) {
        normalized.axisLabels.likelihood = fallback.axisLabels.likelihood;
      }

      const fallbackLevelsByKey = fallback.levels.reduce((acc, level) => {
        acc[level.key] = level;
        return acc;
      }, {});

      normalized.impactValues = normalized.impactValues
        .map((item, idx) => ({
          key: String(item.key || '').toUpperCase(),
          label: item.label || item.key,
          sortOrder: Number.isFinite(item.sortOrder) ? item.sortOrder : idx + 1,
        }))
        .filter((item) => item.key);

      normalized.likelihoodValues = normalized.likelihoodValues
        .map((item, idx) => ({
          key: String(item.key || '').toUpperCase(),
          label: item.label || item.key,
          sortOrder: Number.isFinite(item.sortOrder) ? item.sortOrder : idx + 1,
        }))
        .filter((item) => item.key);

      normalized.levels = normalized.levels
        .map((item, idx) => {
          const key = String(item.key || '').toUpperCase();
          const fallbackLevel = fallbackLevelsByKey[key] || {};
          return {
            key,
            label: item.label || item.key,
            color: item.color || '#32c766',
            owaspSeverityMapping: String(item.owaspSeverityMapping || fallbackLevel.owaspSeverityMapping || 'UNASSIGNED').toUpperCase(),
            action: normalizeActionText(item.action ?? fallbackLevel.action, key),
            sortOrder: Number.isFinite(item.sortOrder) ? item.sortOrder : idx + 1,
          };
        })
        .filter((item) => item.key);

      const validLevelKeys = new Set(normalized.levels.map((level) => level.key));
      normalized.likelihoodValues.forEach((likelihood) => {
        normalized.impactValues.forEach((impact) => {
          const cellKey = `${likelihood.key}::${impact.key}`;
          const defaultCell = DEFAULT_MATRIX[likelihood.key]?.[impact.key];
          const existingCell = normalized.cells[cellKey];
          const candidateLevelKey = String(existingCell?.levelKey || '').toUpperCase();
          const defaultLevelKey = normalized.levels[0]?.key || 'LOW';
          const levelKey = validLevelKeys.has(candidateLevelKey)
            ? candidateLevelKey
            : (defaultCell?.levelKey && validLevelKeys.has(defaultCell.levelKey) ? defaultCell.levelKey : defaultLevelKey);
          normalized.cells[cellKey] = {
            levelKey,
            action: normalizeActionText(existingCell?.action ?? defaultCell?.action, levelKey),
          };
        });
      });

      return normalized;
    },
    getCell(likelihoodKey, impactKey) {
      const cellKey = `${likelihoodKey}::${impactKey}`;
      if (!this.draft.cells[cellKey]) {
        const defaultLevelKey = this.draft.levels[0]?.key || 'LOW';
        this.$set(this.draft.cells, cellKey, { levelKey: defaultLevelKey, action: defaultAction(defaultLevelKey) });
      }
      return this.draft.cells[cellKey];
    },
    setCellLevel(likelihoodKey, impactKey, levelKey) {
      const cell = this.getCell(likelihoodKey, impactKey);
      cell.levelKey = levelKey;
      if (!cell.action || cell.action === '') {
        cell.action = defaultAction(levelKey);
      }
      this.isDirty = true;
    },
    setCellAction(likelihoodKey, impactKey, action) {
      const cell = this.getCell(likelihoodKey, impactKey);
      const normalizedAction = String(action || '').trim();
      cell.action = normalizedAction || defaultAction(cell.levelKey);
      this.isDirty = true;
    },
    getCellDisplay(likelihoodKey, impactKey) {
      const cell = this.getCell(likelihoodKey, impactKey);
      const level = this.levelMap[cell.levelKey] || { key: 'LOW', label: 'Low', color: '#8dd819' };
      return {
        levelKey: level.key,
        levelLabel: level.label,
        levelColor: level.color,
        actionLabel: String(cell.action || '').trim() || defaultAction(level.key),
      };
    },
    mappedSeverityLabel(level) {
      const mapping = String(level?.owaspSeverityMapping || 'UNASSIGNED').toUpperCase();
      switch (mapping) {
        case 'CRITICAL':
          return this.$t('severity.critical');
        case 'HIGH':
          return this.$t('severity.high');
        case 'MEDIUM':
          return this.$t('severity.medium');
        case 'LOW':
          return this.$t('severity.low');
        case 'INFO':
          return this.$t('severity.info');
        default:
          return this.$t('severity.unassigned');
      }
    },
    getCellBackgroundStyle(likelihoodKey, impactKey) {
      const display = this.getCellDisplay(likelihoodKey, impactKey);
      const bg = display.levelColor || LEVEL_COLOR_MAP[display.levelKey] || '#8BC34A';
      return {
        backgroundColor: bg,
        borderColor: 'rgba(255,255,255,0.35)',
        color: contrastTextColor(bg),
      };
    },
    openCellModal(likelihood, impact) {
      if (!this.draft.enabled) {
        return;
      }
      const cell = this.getCell(likelihood.key, impact.key);
      this.cellModal = {
        likelihoodKey: likelihood.key,
        likelihoodLabel: likelihood.label,
        impactKey: impact.key,
        impactLabel: impact.label,
        levelKey: cell.levelKey,
        action: cell.action,
      };
      this.$root.$emit('bv::show::modal', 'riskMatrixCellModal');
    },
    resetCellModal() {
      this.cellModal = {
        likelihoodKey: null,
        likelihoodLabel: '',
        impactKey: null,
        impactLabel: '',
        levelKey: null,
        action: null,
      };
    },
    saveCellModal() {
      if (!this.draft.enabled) {
        return;
      }
      if (!this.cellModal.likelihoodKey || !this.cellModal.impactKey || !this.cellModal.levelKey) {
        this.$toastr.w(this.$t('message.required_fields'));
        return;
      }
      this.setCellLevel(this.cellModal.likelihoodKey, this.cellModal.impactKey, this.cellModal.levelKey);
      this.setCellAction(this.cellModal.likelihoodKey, this.cellModal.impactKey, this.cellModal.action);
      this.$root.$emit('bv::hide::modal', 'riskMatrixCellModal');
    },
    quickFill() {
      if (!this.draft.enabled) {
        return;
      }
      const defaultDraft = createDefaultDraft();
      this.draft.cells = clone(defaultDraft.cells);
      this.isDirty = true;
    },
    openValueModal(type, item = null) {
      if (!this.draft.enabled) {
        return;
      }
      this.valueModalType = type;
      this.valueModalMode = item ? 'edit' : 'create';
      this.valueModal = item
        ? { originalKey: item.key, key: item.key, label: item.label }
        : { originalKey: null, key: '', label: '' };
      this.$root.$emit('bv::show::modal', 'riskMatrixValueModal');
    },
    resetValueModal() {
      this.valueModalMode = 'create';
      this.valueModalType = 'impact';
      this.valueModal = { originalKey: null, key: '', label: '' };
    },
    saveValueModal() {
      if (!this.draft.enabled) {
        return;
      }
      const key = String(this.valueModal.key || '').trim().toUpperCase();
      const label = String(this.valueModal.label || '').trim();
      if (!key || !label) {
        this.$toastr.w(this.$t('message.required_fields'));
        return;
      }

      const listName = this.valueModalType === 'impact' ? 'impactValues' : 'likelihoodValues';
      const list = this.draft[listName];
      if (this.valueModalMode === 'create') {
        if (list.some((item) => item.key === key)) {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
          return;
        }
        list.push({ key, label, sortOrder: list.length + 1 });
      } else {
        const item = list.find((entry) => entry.key === this.valueModal.originalKey);
        if (item) {
          item.label = label;
        }
      }

      this.ensureCellShape();
      this.isDirty = true;
      this.$root.$emit('bv::hide::modal', 'riskMatrixValueModal');
    },
    removeValue(type, key) {
      if (!this.draft.enabled) {
        return;
      }
      const listName = type === 'impact' ? 'impactValues' : 'likelihoodValues';
      this.draft[listName] = this.draft[listName]
        .filter((item) => item.key !== key)
        .map((item, idx) => ({ ...item, sortOrder: idx + 1 }));
      this.ensureCellShape();
      this.isDirty = true;
    },
    openLevelModal(level = null) {
      if (!this.draft.enabled) {
        return;
      }
      this.levelModalMode = level ? 'edit' : 'create';
      this.levelModal = level
        ? {
            originalKey: level.key,
            key: level.key,
            label: level.label,
            color: level.color,
            owaspSeverityMapping: level.owaspSeverityMapping || 'UNASSIGNED',
            action: level.action || '',
          }
        : { originalKey: null, key: '', label: '', color: '#32c766', owaspSeverityMapping: 'UNASSIGNED', action: '' };
      this.$root.$emit('bv::show::modal', 'riskMatrixLevelModal');
    },
    resetLevelModal() {
      this.levelModalMode = 'create';
      this.levelModal = { originalKey: null, key: '', label: '', color: '#32c766', owaspSeverityMapping: 'UNASSIGNED', action: '' };
    },
    saveLevelModal() {
      if (!this.draft.enabled) {
        return;
      }
      const key = String(this.levelModal.key || '').trim().toUpperCase();
      const label = String(this.levelModal.label || '').trim();
      const color = String(this.levelModal.color || '').trim() || '#32c766';
      const owaspSeverityMapping = this.levelModal.owaspSeverityMapping || 'UNASSIGNED';
      const action = String(this.levelModal.action || '').trim();
      if (!key || !label) {
        this.$toastr.w(this.$t('message.required_fields'));
        return;
      }

      if (this.levelModalMode === 'create') {
        if (this.draft.levels.some((level) => level.key === key)) {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
          return;
        }
        this.draft.levels.push({
          key,
          label,
          color,
          owaspSeverityMapping,
          action,
          sortOrder: this.draft.levels.length + 1,
        });
      } else {
        const existing = this.draft.levels.find((level) => level.key === this.levelModal.originalKey);
        if (existing) {
          existing.label = label;
          existing.color = color;
          existing.owaspSeverityMapping = owaspSeverityMapping;
          existing.action = action;
        }
      }
      this.isDirty = true;
      this.$root.$emit('bv::hide::modal', 'riskMatrixLevelModal');
    },
    removeLevel(key) {
      if (!this.draft.enabled) {
        return;
      }
      if (this.usedLevelKeys.has(key)) {
        return;
      }
      this.draft.levels = this.draft.levels
        .filter((level) => level.key !== key)
        .map((level, idx) => ({ ...level, sortOrder: idx + 1 }));
      this.isDirty = true;
    },
    ensureCellShape() {
      const newCells = {};
      this.sortedLikelihoodValues.forEach((likelihood) => {
        this.sortedImpactValues.forEach((impact) => {
          const cellKey = `${likelihood.key}::${impact.key}`;
          newCells[cellKey] = this.draft.cells[cellKey] || {
            levelKey: this.draft.levels[0]?.key || 'LOW',
            action: defaultAction(this.draft.levels[0]?.key),
          };
        });
      });
      this.draft.cells = newCells;
    },
    onToggleCustomMatrix() {
      this.ensureCellShape();
      this.isDirty = true;
    },
    async saveSettings() {
      const payload = clone(this.draft);
      try {
        if (this.$customization && this.$customization.updateRiskMatrixSettings) {
          await this.$customization.updateRiskMatrixSettings(payload);
        }
      } catch (e) {
        this.$toastr.w(this.$t('condition.unsuccessful_action'));
        return;
      }
      let reloadedConfig = null;
      if (this.$customization && this.$customization.preloadRiskMatrixConfig) {
        reloadedConfig = await this.$customization.preloadRiskMatrixConfig();
      }
      if (reloadedConfig?.loadState === 'load_failed') {
        this.draft = this.normalizeDraft(payload);
        this.isDirty = false;
        this.$toastr.w(this.$t('riskMatrix.reloadFailedWarning'));
        return;
      }
      this.draft = this.normalizeDraft(reloadedConfig || payload);
      this.isDirty = false;
      this.$toastr.s(this.$t('admin.configuration_saved'));
    },
  },
  mounted() {
    this.loadSettings();
  },
};
</script>

<style scoped>
.matrix-card-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  font-weight: 600;
}

.matrix-card-body {
  padding: 0.75rem;
}

.matrix-list-row {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.25rem;
  padding: 0.35rem 0.5rem;
  margin-bottom: 0.4rem;
  color: var(--table-head-color);
}

.row-index {
  display: inline-flex;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 0.2rem;
  align-items: center;
  justify-content: center;
  font-size: 80%;
  margin-right: 0.5rem;
  background: rgba(255, 255, 255, 0.08);
}

.color-dot {
  width: 0.85rem;
  height: 0.85rem;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.matrix-grid th,
.matrix-grid td {
  vertical-align: middle;
}

.risk-mapping-card {
  border-color: rgba(57, 116, 184, 0.26);
}

.matrix-tools {
  color: #8ab6de;
}

.matrix-grid {
  border-collapse: separate;
  border-spacing: 0;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 0.55rem;
  background: #121417;
}

.matrix-corner,
.matrix-col-header {
  background: var(--table-head-bg);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: var(--table-head-color);
  font-weight: 600;
}

.matrix-corner {
  min-width: 11rem;
  padding: 0.85rem 0.9rem;
}

.matrix-axis-title {
  font-size: 80%;
  font-weight: 700;
  color: var(--table-head-color);
  line-height: 1.25;
}

.matrix-col-header {
  text-align: left;
  min-width: 10rem;
  padding: 0.75rem 1rem;
}

.matrix-col-label {
  font-weight: 700;
  line-height: 1.1;
  color: var(--table-head-color);
}

.matrix-col-index {
  display: none;
}

.matrix-row-header {
  background: var(--table-head-bg);
  border: 1px solid rgba(255, 255, 255, 0.14);
  padding: 0.65rem 0.7rem;
  min-width: 11rem;
  color: var(--table-head-color);
}

.matrix-row-index {
  display: none;
}

.matrix-row-label {
  font-weight: 700;
}

.matrix-cell-display {
  min-width: 10rem;
  height: 5.2rem;
  border: 1px solid rgba(255, 255, 255, 0.32);
  text-align: center;
  cursor: pointer;
  transition: filter 120ms ease, transform 120ms ease;
}

.matrix-cell-display--disabled {
  cursor: not-allowed;
  filter: saturate(0.8);
}

.matrix-cell-display:hover {
  filter: brightness(1.06);
  transform: translateY(-1px);
}

.matrix-cell-display--disabled:hover {
  filter: saturate(0.8);
  transform: none;
}

.matrix-level-title {
  margin-top: 0.15rem;
  font-weight: 800;
  line-height: 1.1;
}

.matrix-action-label {
  margin-top: 0.35rem;
  font-size: 80%;
  font-weight: 600;
}

.matrix-footer {
  margin-top: 1rem;
}

.inline-label-input {
  height: 1.6rem;
  font-weight: 600;
  padding: 0.1rem 0.4rem;
  background: transparent;
  border-color: var(--primary);
  color: inherit;
  max-width: 180px;
}

.inline-edit-btn {
  opacity: 0.5;
  line-height: 1;
}
.inline-edit-btn:hover {
  opacity: 1;
}
</style>
