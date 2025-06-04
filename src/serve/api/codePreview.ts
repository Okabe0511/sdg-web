import http from "..";
import mockConfigFixReview1 from "/@/mock/review/配置项修复/1.json";
import mockConfigFixReview2 from "/@/mock/review/配置项修复/2.json";
import mockSyntaxFixReview1 from "/@/mock/review/语法修复/1.json";
import mockSyntaxFixReview2 from "/@/mock/review/语法修复/2.json";
import mockDiversityReview1 from "/@/mock/review/配置项多样性/1.json";
import mockDiversityReview2 from "/@/mock/review/配置项多样性/2.json";
import mockCodeMutationReview1 from "/@/mock/review/代码随机变异/1.json";
import mockCodeMutationReview2 from "/@/mock/review/代码随机变异/2.json";
import mockImageGenerationReview2 from "/@/mock/review/基于图像生成代码/2.json";
import mockCodeToImageReview1 from "/@/mock/review/基于代码生成图像/1.json";

import mockImageGenerationReview1 from "/@/mock/review/基于图像生成代码/1.png";
import mockCodeToImageReview2 from "/@/mock/review/基于代码生成图像/2.png";

/**
 * 获取算子预览代码
 * @param operatorName 算子名称
 * @returns 预览代码对象
 */
export const getOperatorPreviewCode = async (operatorName: string) => {
  if (import.meta.env.DEV) {
    // 在开发环境中模拟响应
    let oldCode = "";
    let newCode = "";
    let isOldImage = false;
    let isNewImage = false;
    let oldImageSrc = "";
    let newImageSrc = "";

    switch (operatorName) {
      case "配置项修复算子":
        oldCode = processContentString(mockConfigFixReview1.content);
        newCode = processContentString(mockConfigFixReview2.content);
        break;
      case "语法修复算子":
        oldCode = processContentString(mockSyntaxFixReview1.content);
        newCode = processContentString(mockSyntaxFixReview2.content);
        break;
      case "配置多样性增强算子":
        oldCode = processContentString(mockDiversityReview1.content);
        newCode = processContentString(mockDiversityReview2.content);
        break;
      case "代码扰动算子":
        oldCode = processContentString(mockCodeMutationReview1.content);
        newCode = processContentString(mockCodeMutationReview2.content);
        break;
      case "基于图像生成代码算子":
        isOldImage = true;
        oldImageSrc = mockImageGenerationReview1;
        newCode = processContentString(mockImageGenerationReview2.content);
        break;
      case "基于代码生成图像算子":
        oldCode = processContentString(mockCodeToImageReview1.content);
        isNewImage = true;
        newImageSrc = mockCodeToImageReview2;
        break;
      default:
        oldCode = `// 原始代码示例\nconsole.log("这是算子 ${operatorName} 执行前的代码");`;
        newCode = `// 优化后代码示例\nconsole.log("这是算子 ${operatorName} 执行后的代码");`;
    }

    return Promise.resolve({
      data: {
        oldCode,
        newCode,
        isOldImage,
        isNewImage,
        oldImageSrc,
        newImageSrc,
      },
    });
  }

  // 实际环境中调用真实接口
  return http.get(`/operators/preview/${encodeURIComponent(operatorName)}`);
};

/**
 * 处理字符串中的换行符，将其转换为实际的换行
 * @param content 包含转义符的内容字符串
 * @returns 处理后的字符串
 */
function processContentString(content: string): string {
  if (!content) return "";

  // 直接将\n转换为实际换行符
  return content.replace(/\\n/g, "\n");
}
