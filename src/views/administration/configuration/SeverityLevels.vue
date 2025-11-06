<template>
  <div>
    <div id="severityLevelsToolbar" class="bs-table-custom-toolbar">
      <b-button
        size="md"
        variant="outline-primary"
        @click="showAddModal"
        v-b-tooltip.hover
        :title="$t('admin.severity_level_add')"
      >
        <span class="fa fa-plus"></span> {{ $t('admin.severity_level_add') }}
      </b-button>
    </div>
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="severities"
      :options="options"
    >
    </bootstrap-table>

    <!-- Add/Edit Modal -->
    <b-modal
      id="severityModal"
      :title="isEditing ? $t('admin.severity_level_edit') : $t('admin.severity_level_add')"
      hide-header-close
      no-close-on-backdrop
      @hide="resetForm"
    >
      <b-form>
        <b-form-group
          :label="$t('admin.severity_level_label')"
          label-for="severity-label"
        >
          <b-form-input
            id="severity-label"
            v-model="formData.label"
            required
            :state="formData.label.length > 0 ? true : false"
          />
        </b-form-group>

        <b-form-group
          :label="$t('admin.severity_level_key')"
          label-for="severity-key"
        >
          <b-form-input
            id="severity-key"
            v-model="formData.keyName"
            :readonly="isEditing"
            :disabled="isEditing"
            required
          />
          <b-form-text v-if="isEditing">
            {{ $t('admin.severity_level_key_readonly') }}
          </b-form-text>
        </b-form-group>

        <b-form-group
          :label="$t('admin.severity_level_color')"
          label-for="severity-color"
        >
          <div class="d-flex align-items-center">
            <b-form-input
              id="severity-color"
              v-model="formData.color"
              type="color"
              style="width: 100px; height: 38px"
            />
            <span class="ml-2">{{ formData.color }}</span>
          </div>
        </b-form-group>

        <b-form-group
          :label="$t('admin.severity_level_sort_order')"
          label-for="severity-sort"
        >
          <b-form-input
            id="severity-sort"
            v-model.number="formData.sortOrder"
            type="number"
            min="0"
            required
          />
        </b-form-group>
      </b-form>

      <template v-slot:modal-footer="{ cancel }">
        <b-button size="sm" variant="secondary" @click="cancel()">
          {{ $t('message.cancel') }}
        </b-button>
        <b-button size="sm" variant="primary" @click="saveSeverity">
          {{ $t('message.save') }}
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import common from '../../../shared/common';
import EventBus from '../../../shared/eventbus';
import xssFilters from 'xss-filters';
import permissionsMixin from '../../../mixins/permissionsMixin';
import { PERMISSIONS } from '../../../shared/permissions';

export default {
  mixins: [permissionsMixin],
  data() {
    return {
      severities: [],
      isEditing: false,
      formData: {
        id: null,
        label: '',
        keyName: '',
        color: '#D32F2F',
        sortOrder: 1,
        active: true,
      },
      columns: [
        {
          title: this.$t('admin.severity_level_sort_order'),
          field: 'sortOrder',
          sortable: true,
          width: '10%',
        },
        {
          title: this.$t('admin.severity_level_label'),
          field: 'label',
          sortable: true,
          formatter: (value, row) => {
            return xssFilters.inHTMLData(value);
          },
        },
        {
          title: this.$t('admin.severity_level_key'),
          field: 'keyName',
          sortable: true,
          formatter: (value) => {
            return `<code>${xssFilters.inHTMLData(value)}</code>`;
          },
        },
        {
          title: this.$t('admin.severity_level_color'),
          field: 'color',
          sortable: false,
          formatter: (value) => {
            return `<span style="display:inline-block;width:20px;height:20px;background:${value};border:1px solid #ddd;border-radius:3px;margin-right:8px;"></span><code>${xssFilters.inHTMLData(
              value
            )}</code>`;
          },
        },
        {
          title: this.$t('message.actions'),
          field: 'actions',
          align: 'center',
          sortable: false,
          formatter: (value, row) => {
            return `
              <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${row.id}">
                <i class="fa fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${row.id}" style="margin-left:4px;">
                <i class="fa fa-trash"></i>
              </button>
            `;
          },
          events: {
            'click .edit-btn': (e, value, row) => {
              this.editSeverity(row);
            },
            'click .delete-btn': (e, value, row) => {
              this.deleteSeverity(row);
            },
          },
        },
      ],
      options: {
        search: true,
        showColumns: false,
        showRefresh: true,
        pagination: false,
        silentSort: false,
        sidePagination: 'client',
        toolbar: '#severityLevelsToolbar',
        sortName: 'sortOrder',
        sortOrder: 'asc',
      },
    };
  },
  watch: {
    'formData.label': function (newVal) {
      // Auto-generate key name from label if not editing
      if (!this.isEditing && newVal) {
        this.formData.keyName = newVal
          .toUpperCase()
          .replace(/\s+/g, '_')
          .replace(/[^\w]/g, '');
      }
    },
  },
  methods: {
    loadSeverities() {
      // TODO: Replace with actual API call
      // For now, using mock data
      this.severities = [
        {
          id: 1,
          label: 'Critical',
          keyName: 'CRITICAL',
          color: '#D32F2F',
          sortOrder: 1,
          active: true,
        },
        {
          id: 2,
          label: 'High',
          keyName: 'HIGH',
          color: '#FF6F00',
          sortOrder: 2,
          active: true,
        },
        {
          id: 3,
          label: 'Medium',
          keyName: 'MEDIUM',
          color: '#FFA000',
          sortOrder: 3,
          active: true,
        },
        {
          id: 4,
          label: 'Low',
          keyName: 'LOW',
          color: '#FBC02D',
          sortOrder: 4,
          active: true,
        },
        {
          id: 5,
          label: 'Info',
          keyName: 'INFO',
          color: '#1976D2',
          sortOrder: 5,
          active: true,
        },
        {
          id: 6,
          label: 'Unassigned',
          keyName: 'UNASSIGNED',
          color: '#757575',
          sortOrder: 6,
          active: true,
        },
      ];

      // Refresh table
      this.$refs.table.refresh({ silent: true });
    },
    showAddModal() {
      this.isEditing = false;
      this.formData = {
        id: null,
        label: '',
        keyName: '',
        color: '#D32F2F',
        sortOrder: this.severities.length + 1,
        active: true,
      };
      this.$root.$emit('bv::show::modal', 'severityModal');
    },
    editSeverity(row) {
      this.isEditing = true;
      this.formData = { ...row };
      this.$root.$emit('bv::show::modal', 'severityModal');
    },
    saveSeverity() {
      if (!this.formData.label || !this.formData.keyName) {
        this.$toastr.w(this.$t('message.required_fields'));
        return;
      }

      // TODO: Replace with actual API call
      if (this.isEditing) {
        // Update existing
        const index = this.severities.findIndex(
          (s) => s.id === this.formData.id
        );
        if (index !== -1) {
          this.severities[index] = { ...this.formData };
        }
        this.$toastr.s(this.$t('admin.severity_level_updated'));
      } else {
        // Add new
        const newSeverity = {
          ...this.formData,
          id: Date.now(), // Mock ID generation
        };
        this.severities.push(newSeverity);
        this.$toastr.s(this.$t('admin.severity_level_created'));
      }

      this.$refs.table.refresh({ silent: true });
      this.$root.$emit('bv::hide::modal', 'severityModal');
    },
    deleteSeverity(row) {
      this.$bvModal
        .msgBoxConfirm(this.$t('admin.severity_level_delete_confirm'), {
          title: this.$t('admin.severity_level_delete'),
          okVariant: 'danger',
          okTitle: this.$t('message.delete'),
          cancelTitle: this.$t('message.cancel'),
        })
        .then((confirmed) => {
          if (confirmed) {
            // TODO: Replace with actual API call
            this.severities = this.severities.filter((s) => s.id !== row.id);
            this.$refs.table.refresh({ silent: true });
            this.$toastr.s(this.$t('admin.severity_level_deleted'));
          }
        });
    },
    resetForm() {
      this.formData = {
        id: null,
        label: '',
        keyName: '',
        color: '#D32F2F',
        sortOrder: 1,
        active: true,
      };
      this.isEditing = false;
    },
  },
  mounted() {
    this.loadSeverities();
    EventBus.$on('admin:plugin', (plugin) => {
      if (plugin.component === 'SeverityLevels') {
        this.loadSeverities();
      }
    });
  },
  beforeDestroy() {
    EventBus.$off('admin:plugin');
  },
};
</script>

<style scoped>
.bs-table-custom-toolbar {
  margin-bottom: 10px;
}
</style>
