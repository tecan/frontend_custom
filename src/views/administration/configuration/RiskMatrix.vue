<template>
  <b-card no-body class="risk-matrix-admin">
    <b-card-body>
    <b-form-group class="mb-3">
      <c-switch
        color="primary"
        v-model="draft.enabled"
        label
        v-bind="labelIcon"
        @change="onToggleCustomMatrix"
      />{{ $t('riskMatrix.enableCustom') }}
      <small class="text-muted d-block mt-1">{{ $t('riskMatrix.enableCustomHelp') }}</small>
    </b-form-group>

    <b-collapse :visible="draft.enabled">
    <b-card class="mb-3" no-body>
      <div class="matrix-card-header px-3 py-2">
        <span class="font-weight-bold">{{ $t('riskMatrix.sectionLabelsTitle') }}</span>
      </div>
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
            <c-switch
              color="primary"
              v-model="draft.requireRiskAssessment"
              label
              v-bind="labelIcon"
              :disabled="!draft.enabled"
              @change="isDirty = true"
            />{{ $t('riskMatrix.requireLabel') }} {{ riskAssessmentLabel }}
          </b-col>
          <b-col sm="6">
            <c-switch
              color="primary"
              v-model="draft.requireResidualRiskAssessment"
              label
              v-bind="labelIcon"
              :disabled="!draft.enabled"
              @change="isDirty = true"
            />{{ $t('riskMatrix.requireLabel') }} {{ residualRiskLabel }}
          </b-col>
        </b-row>
      </div>
    </b-card>

    <b-row>
      <b-col lg="4" class="mb-3">
        <b-card class="h-100" no-body>
          <div class="matrix-card-header d-flex justify-content-between align-items-center px-3 py-2">
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
                <span class="font-weight-bold mr-1">{{ axisImpactLabel }}</span>
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
          </div>
          <div class="matrix-card-body">
            <small class="text-muted d-block mb-3">{{ $t('riskMatrix.impactHelp') }}</small>
            <div class="flex-grow-1">
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
            </div>
            <b-button size="sm" variant="outline-primary" class="mt-2" :disabled="!draft.enabled" @click="openValueModal('impact')">
              <i class="fa fa-plus"></i> {{ $t('riskMatrix.addItem') }}
            </b-button>
          </div>
        </b-card>
      </b-col>

      <b-col lg="4" class="mb-3">
        <b-card class="h-100" no-body>
          <div class="matrix-card-header d-flex justify-content-between align-items-center px-3 py-2">
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
                <span class="font-weight-bold mr-1">{{ axisLikelihoodLabel }}</span>
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
          </div>
          <div class="matrix-card-body">
            <small class="text-muted d-block mb-3">{{ $t('riskMatrix.likelihoodHelp') }}</small>
            <div class="flex-grow-1">
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
            </div>
            <b-button size="sm" variant="outline-primary" class="mt-2" :disabled="!draft.enabled" @click="openValueModal('likelihood')">
              <i class="fa fa-plus"></i> {{ $t('riskMatrix.addItem') }}
            </b-button>
          </div>
        </b-card>
      </b-col>

      <b-col lg="4" class="mb-3">
        <b-card class="h-100" no-body>
          <div class="matrix-card-header d-flex justify-content-between align-items-center px-3 py-2">
            <div class="d-flex align-items-center flex-grow-1 mr-2" style="min-width:0">
              <template v-if="editingOwaspLabel">
                <b-form-input
                  ref="owaspLabelInput"
                  v-model="draft.owaspCardLabel"
                  size="sm"
                  class="inline-label-input"
                  :placeholder="$t('riskMatrix.resultLabel')"
                  maxlength="60"
                  @blur="editingOwaspLabel = false; isDirty = true"
                  @keyup.enter="editingOwaspLabel = false; isDirty = true"
                  @keyup.esc="editingOwaspLabel = false"
                />
              </template>
              <template v-else>
                <span class="font-weight-bold mr-1">{{ owaspCardLabelDisplay }}</span>
                <b-button
                  v-if="draft.enabled"
                  size="sm"
                  variant="link"
                  class="p-0 inline-edit-btn"
                  @click="editingOwaspLabel = true; $nextTick(() => $refs.owaspLabelInput && $refs.owaspLabelInput.focus())"
                >
                  <i class="fa fa-pencil fa-sm"></i>
                </b-button>
              </template>
            </div>
            <div class="matrix-card-actions ml-2">
              <c-switch
                color="primary"
                v-model="draft.calculateToRiskEnabled"
                label
                size="sm"
                v-bind="labelIcon"
                :disabled="!draft.enabled"
                @change="isDirty = true"
                class="mb-0"
              />
            </div>
          </div>
          <div class="matrix-card-body">
            <small class="text-muted d-block mb-3">{{ $t('riskMatrix.calculateToRiskEnabledHelp') }}</small>
            <div class="flex-grow-1">
              <div
                v-for="level in draft.levels.slice().sort((a, b) => a.sortOrder - b.sortOrder)"
                :key="level.key"
                class="matrix-list-row d-flex align-items-center"
              >
                <span class="row-index">{{ level.sortOrder }}</span>
                <span class="flex-grow-1">{{ level.label }}</span>
                <span :class="'owasp-badge severity-' + (level.owaspSeverityMapping || 'unassigned').toLowerCase() + '-bg'">
                  {{ mappedSeverityLabel(level) }}
                </span>
                <b-button size="sm" variant="link" :disabled="!draft.enabled" @click="openLevelModal(level)">
                  <i class="fa fa-pencil"></i>
                </b-button>
                <b-button size="sm" variant="link" :disabled="!draft.enabled" @click="removeLevel(level.key)">
                  <i class="fa fa-trash"></i>
                </b-button>
              </div>
            </div>
            <b-button size="sm" variant="outline-primary" class="mt-2" :disabled="!draft.enabled" @click="openLevelModal()">
              <i class="fa fa-plus"></i> {{ $t('riskMatrix.addLevel') }}
            </b-button>
          </div>
        </b-card>
      </b-col>
    </b-row>

    <b-card class="mb-3 risk-mapping-card" no-body>
      <div class="matrix-card-header d-flex justify-content-between align-items-center px-3 py-2">
        <span class="font-weight-bold">{{ $t('riskMatrix.mappingTitle') }}</span>
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

    </b-collapse>
    </b-card-body>
    <b-card-footer>
      <b-button variant="outline-primary" class="px-4" @click="saveSettings">
        {{ $t('message.update') }}
      </b-button>
    </b-card-footer>

    <b-modal
      id="riskMatrixCellModal"
      :title="$t('riskMatrix.editCellTitle')"
      @hide="resetCellModal"
    >
      <p class="text-muted mb-2">
        {{ cellModal.likelihoodLabel }} x {{ cellModal.impactLabel }}
      </p>
      <b-form-group :label="$t('riskMatrix.severityLevel')">
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
  </b-card>
</template>

<script>
import { Switch as cSwitch } from '@coreui/vue';
import { contrastTextColor } from '@/shared/colorUtils';

const DEFAULT_ACTION_BY_LEVEL = {
  LOW: 'accept',
  MEDIUM: 'monitor',
  HIGH: 'mitigate',
  CRITICAL: 'escalate',
};

const ACTION_TEXT_BY_KEY = {
  accept: 'Accept',
  monitor: 'Monitor',
  mitigate: 'Mitigate',
  escalate: 'Escalate',
  // kept for backward-compat with stored configs
  monitor_plan: 'Monitor & Plan',
  mitigate_immediately: 'Mitigate Immediately',
};

const LEGACY_ACTION_TO_KEY = {
  ACCEPT: 'accept',
  MONITOR: 'monitor',
  MONITOR_PLAN: 'monitor_plan',
  'MONITOR & PLAN': 'monitor_plan',
  MITIGATE: 'mitigate',
  MITIGATE_IMMEDIATELY: 'mitigate_immediately',
  'MITIGATE IMMEDIATELY': 'mitigate_immediately',
  ESCALATE: 'escalate',
  BLOCK: 'escalate',
};

const LEVEL_COLOR_MAP = {
  VERY_LOW: '#4CAF50',
  LOW: '#8BC34A',
  MEDIUM: '#FF9800',
  HIGH: '#f44336',
  CRITICAL: '#D32F2F',
};

// ISO 4×4 Risk Matrix (Impact × Likelihood)
const DEFAULT_MATRIX = {
  RARE: {
    INSIGNIFICANT: { levelKey: 'LOW', action: 'accept' },
    MINOR:         { levelKey: 'LOW', action: 'accept' },
    MAJOR:         { levelKey: 'LOW', action: 'accept' },
    SEVERE:        { levelKey: 'MEDIUM', action: 'monitor' },
  },
  UNLIKELY: {
    INSIGNIFICANT: { levelKey: 'LOW', action: 'accept' },
    MINOR:         { levelKey: 'LOW', action: 'accept' },
    MAJOR:         { levelKey: 'MEDIUM', action: 'monitor' },
    SEVERE:        { levelKey: 'HIGH', action: 'mitigate' },
  },
  POSSIBLE: {
    INSIGNIFICANT: { levelKey: 'LOW', action: 'accept' },
    MINOR:         { levelKey: 'MEDIUM', action: 'monitor' },
    MAJOR:         { levelKey: 'HIGH', action: 'mitigate' },
    SEVERE:        { levelKey: 'HIGH', action: 'mitigate' },
  },
  LIKELY: {
    INSIGNIFICANT: { levelKey: 'MEDIUM', action: 'monitor' },
    MINOR:         { levelKey: 'MEDIUM', action: 'monitor' },
    MAJOR:         { levelKey: 'HIGH', action: 'mitigate' },
    SEVERE:        { levelKey: 'CRITICAL', action: 'escalate' },
  },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function translateOrFallback(t, key, fallback) {
  return typeof t === 'function' ? t(key) : fallback;
}

function translateAction(actionKey, t) {
  return translateOrFallback(t, `riskMatrix.actions.${actionKey}`, ACTION_TEXT_BY_KEY[actionKey] || ACTION_TEXT_BY_KEY.monitor);
}

function translateImpactLabel(impactKey, t) {
  switch (impactKey) {
    case 'INSIGNIFICANT':
      return translateOrFallback(t, 'riskMatrix.impacts.insignificant', 'Insignificant');
    case 'MINOR':
      return translateOrFallback(t, 'riskMatrix.impacts.minor', 'Minor');
    case 'MAJOR':
      return translateOrFallback(t, 'riskMatrix.impacts.major', 'Major');
    case 'SEVERE':
      return translateOrFallback(t, 'riskMatrix.impacts.severe', 'Severe');
    // legacy keys kept for stored configs
    case 'LOW':
      return translateOrFallback(t, 'severity.low', 'Low');
    case 'MEDIUM':
      return translateOrFallback(t, 'severity.medium', 'Medium');
    case 'HIGH':
      return translateOrFallback(t, 'severity.high', 'High');
    case 'CRITICAL':
      return translateOrFallback(t, 'severity.critical', 'Critical');
    default:
      return impactKey;
  }
}

function translateLikelihoodLabel(likelihoodKey, t) {
  switch (likelihoodKey) {
    case 'RARE':
      return translateOrFallback(t, 'riskMatrix.likelihoods.rare', 'Rare');
    case 'UNLIKELY':
      return translateOrFallback(t, 'riskMatrix.likelihoods.unlikely', 'Unlikely');
    case 'POSSIBLE':
      return translateOrFallback(t, 'riskMatrix.likelihoods.possible', 'Possible');
    case 'LIKELY':
      return translateOrFallback(t, 'riskMatrix.likelihoods.likely', 'Likely');
    // legacy keys kept for stored configs
    case 'VIRTUALLY_IMPOSSIBLE':
      return translateOrFallback(t, 'riskMatrix.likelihoods.virtually_impossible', 'Virtually Impossible');
    case 'ALMOST_CERTAIN':
      return translateOrFallback(t, 'riskMatrix.likelihoods.almost_certain', 'Almost Certain');
    default:
      return likelihoodKey;
  }
}

function translateLevelLabel(levelKey, t) {
  switch (levelKey) {
    case 'VERY_LOW':
      return translateOrFallback(t, 'riskMatrix.ratings.very_low', 'Very Low');
    case 'LOW':
      return translateOrFallback(t, 'riskMatrix.ratings.low', 'Low');
    case 'MEDIUM':
      return translateOrFallback(t, 'riskMatrix.ratings.medium', 'Medium');
    case 'HIGH':
      return translateOrFallback(t, 'riskMatrix.ratings.high', 'High');
    case 'CRITICAL':
      return translateOrFallback(t, 'riskMatrix.ratings.critical', 'Critical');
    default:
      return levelKey;
  }
}

function defaultAction(levelKey, t) {
  return translateAction(DEFAULT_ACTION_BY_LEVEL[levelKey] || 'monitor', t);
}

function normalizeActionText(action, levelKey, t) {
  const text = String(action || '').trim();
  if (!text) {
    return defaultAction(levelKey, t);
  }
  const actionKey = LEGACY_ACTION_TO_KEY[text.toUpperCase()];
  return actionKey ? translateAction(actionKey, t) : text;
}

function mapLabelsByKey(items) {
  return items.reduce((acc, item) => {
    acc[item.key] = item.label;
    return acc;
  }, {});
}

function localizeDefaultText(value, localizedDefault, englishDefault) {
  const text = String(value || '').trim();
  if (!text || text === localizedDefault || text === englishDefault) {
    return localizedDefault;
  }
  return text;
}

function localizeDefaultLabel(value, key, localizedDefaults, englishDefaults) {
  const text = String(value || '').trim();
  if (!text || text === key || text === localizedDefaults[key] || text === englishDefaults[key]) {
    return localizedDefaults[key] || text || key;
  }
  return text;
}

function createDefaultDraft(t) {
  const impactValues = [
    { key: 'INSIGNIFICANT', label: translateImpactLabel('INSIGNIFICANT', t), sortOrder: 1 },
    { key: 'MINOR', label: translateImpactLabel('MINOR', t), sortOrder: 2 },
    { key: 'MAJOR', label: translateImpactLabel('MAJOR', t), sortOrder: 3 },
    { key: 'SEVERE', label: translateImpactLabel('SEVERE', t), sortOrder: 4 },
  ];
  const likelihoodValues = [
    { key: 'RARE', label: translateLikelihoodLabel('RARE', t), sortOrder: 1 },
    { key: 'UNLIKELY', label: translateLikelihoodLabel('UNLIKELY', t), sortOrder: 2 },
    { key: 'POSSIBLE', label: translateLikelihoodLabel('POSSIBLE', t), sortOrder: 3 },
    { key: 'LIKELY', label: translateLikelihoodLabel('LIKELY', t), sortOrder: 4 },
  ];
  const levels = [
    { key: 'LOW', label: translateLevelLabel('LOW', t), color: '#8BC34A', owaspSeverityMapping: 'LOW', action: defaultAction('LOW', t), sortOrder: 1 },
    { key: 'MEDIUM', label: translateLevelLabel('MEDIUM', t), color: '#FF9800', owaspSeverityMapping: 'MEDIUM', action: defaultAction('MEDIUM', t), sortOrder: 2 },
    { key: 'HIGH', label: translateLevelLabel('HIGH', t), color: '#f44336', owaspSeverityMapping: 'HIGH', action: defaultAction('HIGH', t), sortOrder: 3 },
    { key: 'CRITICAL', label: translateLevelLabel('CRITICAL', t), color: '#D32F2F', owaspSeverityMapping: 'CRITICAL', action: defaultAction('CRITICAL', t), sortOrder: 4 },
  ];
  const calculateToRiskEnabled = false;

  const cells = {};
  likelihoodValues.forEach((likelihood) => {
    impactValues.forEach((impact) => {
      const key = `${likelihood.key}::${impact.key}`;
      const defaultCell = DEFAULT_MATRIX[likelihood.key][impact.key];
      cells[key] = {
        levelKey: defaultCell.levelKey,
        action: translateAction(defaultCell.action, t),
      };
    });
  });

  return {
    enabled: false,
    calculateToRiskEnabled,
    axisLabels: {
      impact: translateOrFallback(t, 'riskMatrix.impact', 'Impact'),
      likelihood: translateOrFallback(t, 'riskMatrix.likelihood', 'Likelihood'),
    },
    levelDefinitionsLabel: translateOrFallback(t, 'riskMatrix.resultLabel', 'Calculated Risk'),
    sectionLabels: {
      riskAssessment: translateOrFallback(t, 'riskMatrix.title', 'Risk Assessment'),
      residualRisk: translateOrFallback(t, 'riskMatrix.residualTitle', 'Residual Risk Assessment'),
    },
    requireRiskAssessment: false,
    requireResidualRiskAssessment: false,
    owaspCardLabel: '',
    impactValues,
    likelihoodValues,
    levels,
    cells,
  };
}

export default {
  name: 'RiskMatrix',
  components: {
    cSwitch,
  },
  data() {
    return {
      labelIcon: { dataOn: '✓', dataOff: '✕' },
      draft: createDefaultDraft(this.$t.bind(this)),
      isDirty: false,
      editingImpactLabel: false,
      editingLikelihoodLabel: false,
      editingOwaspLabel: false,
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
    owaspCardLabelDisplay() {
      const label = String(this.draft?.owaspCardLabel || '').trim();
      return label || this.$t('riskMatrix.resultLabel');
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
        loaded = createDefaultDraft(this.$t.bind(this));
      }

      this.draft = this.normalizeDraft(loaded);
      this.isDirty = false;
    },
    normalizeDraft(input) {
      const translate = this.$t.bind(this);
      const fallback = createDefaultDraft(translate);
      const englishFallback = createDefaultDraft();
      const fallbackImpactLabels = mapLabelsByKey(fallback.impactValues);
      const englishImpactLabels = mapLabelsByKey(englishFallback.impactValues);
      const fallbackLikelihoodLabels = mapLabelsByKey(fallback.likelihoodValues);
      const englishLikelihoodLabels = mapLabelsByKey(englishFallback.likelihoodValues);
      const fallbackLevelLabels = mapLabelsByKey(fallback.levels);
      const englishLevelLabels = mapLabelsByKey(englishFallback.levels);
      const normalized = {
        enabled: input?.enabled === true,
        calculateToRiskEnabled: input?.calculateToRiskEnabled === true,
        axisLabels: {
          impact: localizeDefaultText(input?.axisLabels?.impact, fallback.axisLabels.impact, englishFallback.axisLabels.impact),
          likelihood: localizeDefaultText(input?.axisLabels?.likelihood, fallback.axisLabels.likelihood, englishFallback.axisLabels.likelihood),
        },
        levelDefinitionsLabel: localizeDefaultText(input?.levelDefinitionsLabel, fallback.levelDefinitionsLabel, englishFallback.levelDefinitionsLabel),
        sectionLabels: {
          riskAssessment: localizeDefaultText(input?.sectionLabels?.riskAssessment, fallback.sectionLabels.riskAssessment, englishFallback.sectionLabels.riskAssessment),
          residualRisk: localizeDefaultText(input?.sectionLabels?.residualRisk, fallback.sectionLabels.residualRisk, englishFallback.sectionLabels.residualRisk),
        },
        requireRiskAssessment: input?.requireRiskAssessment === true,
        requireResidualRiskAssessment: input?.requireResidualRiskAssessment === true,
        owaspCardLabel: String(input?.owaspCardLabel || '').trim(),
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
          label: localizeDefaultLabel(item.label || item.key, String(item.key || '').toUpperCase(), fallbackImpactLabels, englishImpactLabels),
          sortOrder: Number.isFinite(item.sortOrder) ? item.sortOrder : idx + 1,
        }))
        .filter((item) => item.key);

      normalized.likelihoodValues = normalized.likelihoodValues
        .map((item, idx) => ({
          key: String(item.key || '').toUpperCase(),
          label: localizeDefaultLabel(item.label || item.key, String(item.key || '').toUpperCase(), fallbackLikelihoodLabels, englishLikelihoodLabels),
          sortOrder: Number.isFinite(item.sortOrder) ? item.sortOrder : idx + 1,
        }))
        .filter((item) => item.key);

      normalized.levels = normalized.levels
        .map((item, idx) => {
          const key = String(item.key || '').toUpperCase();
          const fallbackLevel = fallbackLevelsByKey[key] || {};
          return {
            key,
            label: localizeDefaultLabel(item.label || item.key, key, fallbackLevelLabels, englishLevelLabels),
            color: item.color || '#32c766',
            owaspSeverityMapping: String(item.owaspSeverityMapping || fallbackLevel.owaspSeverityMapping || 'UNASSIGNED').toUpperCase(),
            action: normalizeActionText(item.action ?? fallbackLevel.action, key, translate),
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
            action: normalizeActionText(existingCell?.action ?? defaultCell?.action, levelKey, translate),
          };
        });
      });

      return normalized;
    },
    getCell(likelihoodKey, impactKey) {
      const cellKey = `${likelihoodKey}::${impactKey}`;
      if (!this.draft.cells[cellKey]) {
        const defaultLevelKey = this.draft.levels[0]?.key || 'LOW';
        this.$set(this.draft.cells, cellKey, { levelKey: defaultLevelKey, action: defaultAction(defaultLevelKey, this.$t.bind(this)) });
      }
      return this.draft.cells[cellKey];
    },
    setCellLevel(likelihoodKey, impactKey, levelKey) {
      const cell = this.getCell(likelihoodKey, impactKey);
      cell.levelKey = levelKey;
      if (!cell.action || cell.action === '') {
        cell.action = defaultAction(levelKey, this.$t.bind(this));
      }
      this.isDirty = true;
    },
    setCellAction(likelihoodKey, impactKey, action) {
      const cell = this.getCell(likelihoodKey, impactKey);
      const normalizedAction = String(action || '').trim();
      cell.action = normalizedAction || defaultAction(cell.levelKey, this.$t.bind(this));
      this.isDirty = true;
    },
    getCellDisplay(likelihoodKey, impactKey) {
      const cell = this.getCell(likelihoodKey, impactKey);
      const level = this.levelMap[cell.levelKey] || { key: 'LOW', label: translateLevelLabel('LOW', this.$t.bind(this)), color: '#8dd819' };
      return {
        levelKey: level.key,
        levelLabel: level.label,
        levelColor: level.color,
        actionLabel: String(cell.action || '').trim() || defaultAction(level.key, this.$t.bind(this)),
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
    severityColor(mapping) {
      switch (String(mapping || '').toUpperCase()) {
        case 'CRITICAL': return '#D32F2F';
        case 'HIGH':     return '#f44336';
        case 'MEDIUM':   return '#FF9800';
        case 'LOW':      return '#8BC34A';
        case 'INFO':     return '#4CAF50';
        default:         return '#6c757d';
      }
    },
    severityBadgeStyle(level) {
      const bg = level.color || '#6c757d';
      return {
        backgroundColor: bg,
        color: contrastTextColor(bg),
        border: 'none',
      };
    },
    getCellBackgroundStyle(likelihoodKey, impactKey) {
      const display = this.getCellDisplay(likelihoodKey, impactKey);
      const bg = display.levelColor || LEVEL_COLOR_MAP[display.levelKey] || '#8BC34A';
      return {
        backgroundColor: bg,
        borderColor: 'rgba(255,255,255,0.35)',
        color: '#ffffff',
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
      const defaultDraft = createDefaultDraft(this.$t.bind(this));
      this.draft.impactValues = clone(defaultDraft.impactValues);
      this.draft.likelihoodValues = clone(defaultDraft.likelihoodValues);
      this.draft.levels = clone(defaultDraft.levels);
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
            action: defaultAction(this.draft.levels[0]?.key, this.$t.bind(this)),
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
  background-color: rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.matrix-card-actions {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
}

.matrix-card-actions >>> .c-switch {
  margin-bottom: 0;
}

.matrix-card-body {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  flex: 1;
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

.owasp-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.15rem 0.55rem;
  border-radius: 0.25rem;
  font-size: 75%;
  font-weight: 600;
  color: #fff;
  margin-right: 0.25rem;
  white-space: nowrap;
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
  text-align: center;
}

.matrix-axis-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--table-head-color);
  line-height: 1.1;
}

.matrix-col-header {
  text-align: center;
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
  text-align: center;
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
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  backface-visibility: hidden;
}

.matrix-action-label {
  margin-top: 0.35rem;
  font-size: 80%;
  font-weight: 600;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  backface-visibility: hidden;
}

.matrix-footer {
  margin-top: 1rem;
}

.calculate-to-risk-table {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.35rem;
  overflow: hidden;
}

.ctr-table-header {
  background: var(--table-head-bg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.85rem;
  color: var(--table-head-color);
}

.ctr-table-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: var(--table-head-color);
}

.ctr-table-row:last-child {
  border-bottom: none;
}

.ctr-mapped-col {
  min-width: 10rem;
}

.ctr-edit-col {
  min-width: 2.5rem;
  text-align: right;
}

.ctr-disabled {
  opacity: 0.4;
  pointer-events: none;
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
