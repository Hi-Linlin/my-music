<template>
  <div class="test-page">
    <ul>
      <li
        v-for="(item, index) in originList"
        ref="origin"
        @mousedown="onMousedown(index)"
        class="list-item">{{ item }}
        </li>
    </ul>

    <div class="target-list" @mouseup="onMouseup">
      <ul>
        <li
          v-for="(item, index) in targetList"
          ref="target"
          class="list-item">{{ item }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'tast-page',

    data() {
      return {
        originList: ['origin1', 'origin2', 'origin3'],
        targetList: ['target1', 'target2', 'target3'],
        startDrag: false,
        targetDetails: [],
        activeItemAttr: {},
        activeItemDom: {}
      };
    },

    mounted() {
      //获取目标列表项的高度、左边距、上边距与垂直中心点
      const targetDetails = [];
      this.$refs.origin.forEach(item => {
        const result = {};
        result.center = item.offsetTop + item.offsetHeight / 2;
        result.height = item.offsetHeight;
        result.width = item.offsetWidth;
        result.left = item.getBoundingClientRect().left;
        result.top = item.getBoundingClientRect().top;
        targetDetails.push(result);
      });
      this.targetDetails = targetDetails;

      //监听document
      document.addEventListener("mousemove", (e) => {
        if (!this.startDrag) return;
        this.activeItemDom.style.top = e.clientY - this.activeItemAttr.height / 2 + 'px';
        this.activeItemDom.style.left = e.clientX - this.activeItemAttr.width / 2 + 'px';
      })
      document.addEventListener("mouseup", () => {
        if (!this.startDrag) return;
        this.activeItemDom.remove();
        this.startDrag = false;
      })
    },

    methods: {
      onMousedown(index) {
        this.startDrag = true;

        const activeItem = this.$refs.origin[index];
        this.activeItemAttr = this.targetDetails[index];

        const dragItem = activeItem.cloneNode(true);
        dragItem.className = 'drag-item list-item';
        document.querySelector('.target-list').appendChild(dragItem);

        this.activeItemDom = document.querySelector('.drag-item');
        this.activeItemDom.style.left = this.activeItemAttr.left + 'px';
        this.activeItemDom.style.top = this.activeItemAttr.top + 'px';
      },

      onMouseup() {
        this.targetList.push('2323');
      }
    }
  }
</script>

<style lang="less">
  .test-page {
    .list-item {
      width: 200px;
      border: 1px solid #999;
      line-height: 50px;
    }

    .drag-item {
      position: absolute;
      background-color: skyblue;
    }
  }
</style>
