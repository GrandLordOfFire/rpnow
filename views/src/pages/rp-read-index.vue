<template>
  <div id="app" :class="{'dark-theme':nightMode}">
    <div id="loading" v-if="rp == null && loadError == null">
      <i class="material-icons">hourglass_full</i>
      <span>Loading...</span>
    </div>

    <div id="loading" v-if="loadError != null">
      <i class="material-icons">error</i>
      <span>Failed to load RP! {{ loadError }}</span>
    </div>

    <template v-if="rp != null">
      <div id="main-column">
        <div id="chat-header">
          <button class="icon-button" @click="nightMode = !nightMode">
            <i class="material-icons" title="Toggle night mode">brightness_4</i>
          </button>
          <span>
            {{ rp.title }}
          </span>
        </div>

        <div id="messages">
          <div id="archive-advice" v-if="rp.pageCount === 0">
            Nothing has been written yet.
          </div>

          <div id="archive-advice" v-if="rp.pageCount > 0">
            Select a page to start reading!
          </div>

          <div id="archive-index">
            <template v-for="n of rp.pageCount">
              <router-link class="page-number-link" :to="'/read/'+readCode+'/page/'+n" :key="n">
                {{ n }}
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
  import axios from 'axios';
  import { syncToLocalStorage } from '../components/sync-to-localstorage'

  export default {
    data() {
      return {
        readCode: null,
        rp: null,
        loadError: null,
        nightMode: false,
      };
    },
    beforeMount() {
      // get rpCode from URL
      this.readCode = location.pathname.match(/\/read\/([^/]+)/)[1];

      // sync certain properties on this component with values in localStorage
      syncToLocalStorage(this, {
        nightMode: 'rpnow.global.nightMode',
      });
    },
    methods: {
      changePage(pageNumber) {
        this.$router.push('./'+pageNumber);
      }
    },
    mounted() {
      axios.get('/api/rp/' + this.readCode + '/pages')
        .then(res => {
          this.rp = res.data;
          document.title = this.rp.title;
        })
        .catch(() => {
          this.loadError = 'Check the URL and try again.'
        });
    },
  };
</script>

