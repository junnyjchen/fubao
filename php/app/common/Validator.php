<?php
/**
 * 数据验证辅助类
 */

namespace app\common;

class Validator
{
    private $data = [];
    private $rules = [];
    private $messages = [];
    private $errors = [];

    /**
     * 构造函数
     */
    public function __construct($data = [])
    {
        $this->data = $data;
    }

    /**
     * 设置验证规则
     */
    public function rules($rules)
    {
        $this->rules = $rules;
        return $this;
    }

    /**
     * 设置错误消息
     */
    public function messages($messages)
    {
        $this->messages = $messages;
        return $this;
    }

    /**
     * 执行验证
     */
    public function validate()
    {
        $this->errors = [];

        foreach ($this->rules as $field => $ruleStr) {
            $rules = explode('|', $ruleStr);
            $value = $this->getValue($field);

            foreach ($rules as $rule) {
                $this->validateRule($field, $value, $rule);
            }
        }

        return empty($this->errors);
    }

    /**
     * 验证单条规则
     */
    private function validateRule($field, $value, $rule)
    {
        // 解析规则和参数
        $params = [];
        if (strpos($rule, ':') !== false) {
            list($rule, $paramStr) = explode(':', $rule, 2);
            $params = explode(',', $paramStr);
        }

        $method = 'validate' . ucfirst($rule);
        
        if (method_exists($this, $method)) {
            if (!$this->$method($field, $value, $params)) {
                $this->addError($field, $rule, $params);
            }
        }
    }

    /**
     * 获取字段值
     */
    private function getValue($field)
    {
        if (strpos($field, '.') !== false) {
            $keys = explode('.', $field);
            $value = $this->data;
            foreach ($keys as $key) {
                if (!isset($value[$key])) {
                    return null;
                }
                $value = $value[$key];
            }
            return $value;
        }

        return $this->data[$field] ?? null;
    }

    /**
     * 添加错误
     */
    private function addError($field, $rule, $params)
    {
        $key = $field . '.' . $rule;
        
        if (isset($this->messages[$key])) {
            $message = $this->messages[$key];
        } else {
            $message = $this->getDefaultMessage($field, $rule, $params);
        }

        if (!isset($this->errors[$field])) {
            $this->errors[$field] = [];
        }
        $this->errors[$field][] = $message;
    }

    /**
     * 获取默认消息
     */
    private function getDefaultMessage($field, $rule, $params)
    {
        $fieldName = $field;
        $messages = [
            'required' => "{$fieldName}不能为空",
            'email' => "{$fieldName}必须是有效的邮箱地址",
            'phone' => "{$fieldName}必须是有效的手机号码",
            'min' => "{$fieldName}不能少于{$params[0]}个字符",
            'max' => "{$fieldName}不能超过{$params[0]}个字符",
            'minValue' => "{$fieldName}不能小于{$params[0]}",
            'maxValue' => "{$fieldName}不能大于{$params[0]}",
            'numeric' => "{$fieldName}必须是数字",
            'integer' => "{$fieldName}必须是整数",
            'in' => "{$fieldName}的值不在允许范围内",
            'notIn' => "{$fieldName}的值不允许",
            'url' => "{$fieldName}必须是有效的URL",
            'ip' => "{$fieldName}必须是有效的IP地址",
            'alpha' => "{$fieldName}只能包含字母",
            'alphaNum' => "{$fieldName}只能包含字母和数字",
            'date' => "{$fieldName}必须是有效的日期",
            'regex' => "{$fieldName}格式不正确",
            'confirmed' => "{$fieldName}确认不匹配",
            'unique' => "{$fieldName}已存在",
            'exists' => "{$fieldName}不存在",
        ];

        return $messages[$rule] ?? "{$fieldName}验证失败";
    }

    /**
     * 获取错误列表
     */
    public function getErrors()
    {
        return $this->errors;
    }

    /**
     * 获取第一个错误
     */
    public function getFirstError()
    {
        foreach ($this->errors as $fieldErrors) {
            if (!empty($fieldErrors)) {
                return $fieldErrors[0];
            }
        }
        return null;
    }

    /**
     * 是否有错误
     */
    public function hasErrors()
    {
        return !empty($this->errors);
    }

    // ========== 验证方法 ==========

    /**
     * 必填
     */
    private function validateRequired($field, $value, $params)
    {
        return !($value === null || $value === '');
    }

    /**
     * 邮箱
     */
    private function validateEmail($field, $value, $params)
    {
        if ($value === null || $value === '') return true;
        return filter_var($value, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * 手机号
     */
    private function validatePhone($field, $value, $params)
    {
        if ($value === null || $value === '') return true;
        return preg_match('/^1[3-9]\d{9}$/', $value) === 1;
    }

    /**
     * 最小长度
     */
    private function validateMin($field, $value, $params)
    {
        if ($value === null || $value === '') return true;
        return mb_strlen($value) >= intval($params[0]);
    }

    /**
     * 最大长度
     */
    private function validateMax($field, $value, $params)
    {
        if ($value === null || $value === '') return true;
        return mb_strlen($value) <= intval($params[0]);
    }

    /**
     * 最小值
     */
    private function validateMinValue($field, $value, $params)
    {
        if ($value === null || $value === '') return true;
        return floatval($value) >= floatval($params[0]);
    }

    /**
     * 最大值
     */
    private function validateMaxValue($field, $value, $params)
    {
        if ($value === null || $value === '') return true;
        return floatval($value) <= floatval($params[0]);
    }

    /**
     * 数字
     */
    private function validateNumeric($field, $value, $params)
    {
        if ($value === null || $value === '') return true;
        return is_numeric($value);
    }

    /**
     * 整数
     */
    private function validateInteger($field, $value, $params)
    {
        if ($value === null || $value === '') return true;
        return filter_var($value, FILTER_VALIDATE_INT) !== false;
    }

    /**
     * 在列表中
     */
    private function validateIn($field, $value, $params)
    {
        if ($value === null || $value === '') return true;
        return in_array($value, $params);
    }

    /**
     * 不在列表中
     */
    private function validateNotIn($field, $value, $params)
    {
        if ($value === null || $value === '') return true;
        return !in_array($value, $params);
    }

    /**
     * URL
     */
    private function validateUrl($field, $value, $params)
    {
        if ($value === null || $value === '') return true;
        return filter_var($value, FILTER_VALIDATE_URL) !== false;
    }

    /**
     * IP地址
     */
    private function validateIp($field, $value, $params)
    {
        if ($value === null || $value === '') return true;
        return filter_var($value, FILTER_VALIDATE_IP) !== false;
    }

    /**
     * 纯字母
     */
    private function validateAlpha($field, $value, $params)
    {
        if ($value === null || $value === '') return true;
        return preg_match('/^[a-zA-Z]+$/', $value) === 1;
    }

    /**
     * 字母和数字
     */
    private function validateAlphaNum($field, $value, $params)
    {
        if ($value === null || $value === '') return true;
        return preg_match('/^[a-zA-Z0-9]+$/', $value) === 1;
    }

    /**
     * 日期
     */
    private function validateDate($field, $value, $params)
    {
        if ($value === null || $value === '') return true;
        $format = $params[0] ?? 'Y-m-d';
        $d = \DateTime::createFromFormat($format, $value);
        return $d && $d->format($format) === $value;
    }

    /**
     * 正则
     */
    private function validateRegex($field, $value, $params)
    {
        if ($value === null || $value === '') return true;
        return preg_match($params[0], $value) === 1;
    }

    /**
     * 确认匹配
     */
    private function validateConfirmed($field, $value, $params)
    {
        if ($value === null || $value === '') return true;
        $confirmationField = $field . '_confirmation';
        return $value === ($this->data[$confirmationField] ?? null);
    }
}
