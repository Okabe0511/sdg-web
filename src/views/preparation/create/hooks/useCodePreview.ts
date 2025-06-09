import { ref } from "vue";
import { createPatch } from "diff";
import * as Diff2Html from "diff2html";
import { getOperatorPreviewCode } from "/@/serve/api/codePreview";
import "diff2html/bundles/css/diff2html.min.css";
import "../styles/codePreview.css"; // 导入自定义样式

export const useCodePreview = () => {
  const diffHtml = ref("");
  const isLoading = ref(false);
  const isOldImage = ref(false);
  const isNewImage = ref(false);
  const oldImageSrc = ref("");
  const newImageSrc = ref("");

  /**
   * 生成代码差异显示内容
   * @param step 当前步骤对象
   */
  const generateCodeDiff = async (step: any) => {
    isLoading.value = true;
    diffHtml.value = "";

    // 重置图像相关标志
    isOldImage.value = false;
    isNewImage.value = false;
    oldImageSrc.value = "";
    newImageSrc.value = "";

    try {
      // 获取算子预览代码
      const response = await getOperatorPreviewCode(step.name);

      const { data } = response;

      if (!data) {
        diffHtml.value = '<div class="no-diff-data">暂无预览数据</div>';
        return;
      }

      const {
        oldCode,
        newCode,
        isOldImage: oldImg,
        isNewImage: newImg,
        oldImageSrc: oldSrc,
        newImageSrc: newSrc,
      } = data;

      // 设置图像相关属性
      isOldImage.value = oldImg;
      isNewImage.value = newImg;
      oldImageSrc.value = oldSrc || "";
      newImageSrc.value = newSrc || "";

      // 根据不同情况处理显示内容
      if (isOldImage.value || isNewImage.value) {
        // 至少一边是图像，创建左右布局的HTML
        let html = '<div class="code-image-preview side-by-side-layout">';

        // 左侧（原始内容）
        html += '<div class="content-column original-content">';
        html += "<h3>原始内容</h3>";
        html += '<div class="content-wrapper">';
        if (isOldImage.value) {
          // 修改图像容器样式，使其固定
          html += `<div class="image-container fixed-height"><img src="${oldImageSrc.value}" alt="原始图像" /></div>`;
        } else if (oldCode) {
          // 修改代码容器样式，使其可滚动
          html += `<div class="code-container scrollable"><pre><code class="language-json">${escapeHtml(
            oldCode
          )}</code></pre></div>`;
        } else {
          html += '<div class="empty-content">无内容</div>';
        }
        html += "</div>"; // content-wrapper 结束
        html += "</div>"; // original-content 结束

        // 右侧（处理后内容）
        html += '<div class="content-column processed-content">';
        html += "<h3>处理后内容</h3>";
        html += '<div class="content-wrapper">';
        if (isNewImage.value) {
          // 修改图像容器样式，使其固定
          html += `<div class="image-container fixed-height"><img src="${newImageSrc.value}" alt="处理后图像" /></div>`;
        } else if (newCode) {
          // 修改代码容器样式，使其可滚动
          html += `<div class="code-container scrollable"><pre><code class="language-json">${escapeHtml(
            newCode
          )}</code></pre></div>`;
        } else {
          html += '<div class="empty-content">无内容</div>';
        }
        html += "</div>"; // content-wrapper 结束
        html += "</div>"; // processed-content 结束

        html += "</div>"; // code-image-preview 结束
        diffHtml.value = html;
      } else if (oldCode && newCode) {
        // 两边都是代码，使用diff2html生成差异
        const patch = createPatch(step.name, oldCode, newCode, "", "", {
          context: 3,
        });
        const diffJson = Diff2Html.parse(patch);
        diffHtml.value = Diff2Html.html(diffJson, {
          drawFileList: false,
          matching: "lines",
          outputFormat: "side-by-side",
          renderNothingWhenEmpty: true,
        });
      } else {
        diffHtml.value =
          '<div class="no-diff-data">无法生成差异，缺少数据</div>';
      }
    } catch (error) {
      console.error("获取代码预览失败:", error);
      diffHtml.value = '<div class="error-message">获取预览数据失败</div>';
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * HTML转义
   */
  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  return {
    diffHtml,
    isLoading,
    generateCodeDiff,
    isOldImage,
    isNewImage,
    oldImageSrc,
    newImageSrc,
  };
};
