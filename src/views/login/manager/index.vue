<script lang="ts">
import { defineComponent, onMounted, ref, reactive } from "vue";
import { message } from "ant-design-vue";
import { UserOutlined, LockOutlined } from "@ant-design/icons-vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { login } from "/@/serve/api/login";
import { getToken } from "/@/serve";

export default defineComponent({
  components: {
    UserOutlined,
    LockOutlined,
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    const loading = ref(false);
    const formRef = ref();

    // 表单状态
    const formState = reactive({
      username: "",
      password: "",
    });

    // 表单验证规则
    const rules = {
      username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
      password: [{ required: true, message: "请输入密码", trigger: "blur" }],
    };

    // 登录处理
    const handleFinish = async (values: any) => {
      try {
        loading.value = true;
        // 使用预定义的API登录接口
        // const response = await login({
        //   account: values.username,
        //   password: values.password,
        // });

        // 成功提示
        message.success("登录成功");
        // 跳转到首页
        router.push("/home/list");
      } catch (error: any) {
        console.log(error);

        // 错误提示
        message.error(error?.data?.message || "登录失败");
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {});

    return {
      formState,
      loading,
      rules,
      formRef,
      handleFinish,
    };
  },
});
</script>
<template>
  <div class="login-holder">
    <div class="login-container">
      <!-- 系统名称 -->
      <div class="system-title">
        <h1 class="login-name">数据制备任务系统</h1>
      </div>

      <!-- 登录卡片 -->
      <div class="login-card">
        <div class="card">
          <div class="title-box">
            <div class="title">账号登录</div>
          </div>

          <!-- 登录表单 -->
          <a-form
            class="login-form"
            :model="formState"
            :rules="rules"
            ref="formRef"
            @finish="handleFinish"
          >
            <a-form-item name="username">
              <a-input
                v-model:value="formState.username"
                placeholder="请输入用户名"
                size="large"
              >
                <template #prefix>
                  <UserOutlined />
                </template>
              </a-input>
            </a-form-item>

            <a-form-item name="password">
              <a-input-password
                v-model:value="formState.password"
                placeholder="请输入密码"
                size="large"
                @keyup.enter="handleFinish(formState)"
              >
                <template #prefix>
                  <LockOutlined />
                </template>
              </a-input-password>
            </a-form-item>

            <a-form-item>
              <a-button
                type="primary"
                html-type="submit"
                :loading="loading"
                class="login-button"
                size="large"
                block
              >
                登录
              </a-button>
            </a-form-item>
          </a-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.login-holder {
  width: 100%;
  height: 100vh;
  box-sizing: border-box;
  margin: 0;
  background: url(https://azalea-official.oss-cn-hangzhou.aliyuncs.com/yunzugong-web-background.png)
    no-repeat;
  background-size: cover;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 480px;
}

.system-title {
  margin-bottom: 30px;
  text-align: center;
}

.login-name {
  font-size: 32px;
  font-weight: 500;
  color: rgba(0, 98, 106, 1);
  line-height: 1.5;
  letter-spacing: 8px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
}

.login-card {
  width: 100%;
}

.card {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  width: 100%;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.title-box {
  margin-bottom: 30px;
  text-align: center;

  .title {
    font-size: 24px;
    font-weight: 600;
    color: rgba(37, 37, 37, 1);
    line-height: 33px;
    letter-spacing: 1px;
  }
}

.login-form {
  margin-top: 20px;
}

.login-button {
  margin-top: 20px;
  height: 50px; // 增加高度
  font-size: 16px;
  width: 100% !important; // 确保按钮占满整个容器宽度
  border-radius: 4px; // 适当的圆角
  font-weight: 500; // 字体加粗一点
  letter-spacing: 2px; // 字体间距增加
  box-shadow: 0 2px 8px rgba(0, 98, 106, 0.3); // 添加阴影效果
  transition: all 0.3s ease; // 添加过渡效果

  &:hover {
    transform: translateY(-2px); // 悬停时轻微上浮
    box-shadow: 0 4px 12px rgba(0, 98, 106, 0.4); // 悬停时阴影增强
  }

  &:active {
    transform: translateY(1px); // 点击时下沉效果
    box-shadow: 0 2px 4px rgba(0, 98, 106, 0.3); // 点击时阴影减弱
  }
}

// 响应式调整
@media screen and (max-width: 768px) {
  .login-container {
    max-width: 90%;
  }

  .card {
    padding: 30px 20px;
  }

  .login-name {
    font-size: 28px;
    letter-spacing: 5px;
  }
}
</style>
