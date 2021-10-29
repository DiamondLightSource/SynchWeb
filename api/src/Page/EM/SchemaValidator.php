<?php

namespace SynchWeb\Page\EM;

/**
 * Validate data posted in JSON for database insertions, etc.
 */
class SchemaValidator
{
    private $postData;
    private $schema;

    public function __construct($schema)
    {
        $this->schema = $schema;
    }

    public function validateJsonPostData($json)
    {
        $this->postData = $this->decodeJson($json);
        $invalid = array();
        $valid = array();

        foreach ($this->schema->ruleSet() as $fieldName => $rules) {
            $value = $this->postData[$fieldName];

            if (!$this->isRequired($rules, $value)) {
                continue;
            }

            $result = $this->validateArgument($fieldName, $value, $rules);
            if ($result === true) {
                $valid[$fieldName] = $value;
                continue;
            }

            $invalid[$fieldName] = $result;
        }

        return array($invalid, $valid);
    }

    private function decodeJson($json)
    {
        $data = json_decode($json, true);
        return gettype($data) == 'array' ? $data : array();
    }

    protected function validateArgument($fieldName, $value, $rules)
    {
        $typedValue = $this->schema->typedParameter(
            $fieldName,
            $this->postData
        );
        foreach ($rules as $ruleName => $rule) {
            $constraint = 'check' . ucfirst($ruleName);
            /*  Not all fields in a rule set are, strictly speaking, "rules"
                If there's no checker here, it's probably a label or something
                else "neutral"
            */
            if (method_exists($this, $constraint)) {
                $flagOrMessage = call_user_func(
                    array($this, $constraint),
                    $rule,
                    $value,
                    $typedValue
                );
                if ($flagOrMessage !== true) {
                    return $flagOrMessage;
                }
            }
        }
        return true;
    }

    /**
     * Check for the 'required' validation rule
     *
     * @param boolean|string|array $required
     * @param mixed $value
     * @param mixed $typedValue
     *
     * @return boolean|string - either boolean true or an error message
     *
     * @SuppressWarnings(PHPMD.UnusedFormalParameter)
     * @SuppressWarnings(PHPMD.UnusedPrivateMethod)
     */
    private function checkRequired($required, $value, $typedValue)
    {
        if ($required === 'optional') {
            return true;
        }

        return ($value !== '' && $value !== null) ? true : 'is required';
    }

    /**
     * Check for the 'pattern' validation rule
     *
     * @param array $patternName
     * @param mixed $value
     * @param mixed $typedValue
     *
     * @return boolean|string - either boolean true or an error message
     *
     * @SuppressWarnings(PHPMD.UnusedPrivateMethod)
     * @SuppressWarnings(PHPMD.UnusedFormalParameter)
     */
    private function checkPattern($patternName, $value, $typedValue)
    {
        $patterns = array(
            'filename' => array(
                'regex' => '/^[\w\-_]+\.[\w]{3,4}$/',
                'message' => 'must be a valid filename'
            ),
            'directory' => array(
                'regex' => '/^[\w\-_]+$/',
                'message' => 'only alphanumerics, "-" and "_" allowed'
            )
        );
        $pattern = $patterns[$patternName];

        return preg_match($pattern['regex'], $value) === 1 ?
            true : $pattern['message'];
    }

    /**
     * Check for the 'options' validation rule
     *
     * @param array $options - all possible values the field can have
     * @param mixed $value
     * @param mixed $typedValue
     *
     * @return boolean|string - either boolean true or an error message
     *
     * @SuppressWarnings(PHPMD.UnusedPrivateMethod)
     * @SuppressWarnings(PHPMD.UnusedFormalParameter)
     */
    private function checkOptions($options, $value, $typedValue)
    {
        return in_array("$value", $options, true) ?
            true : "$value is not known";
    }

    /**
     * Assert that a value is of a given type
     *
     * @param string $type - the PHP type to assert
     * @param mixed $value - the value to check
     *
     * @return boolean
     */
    private function isCorrectType($type, $value, $typedValue)
    {
        if ($type == 'boolean') {
            return in_array($value, array('true', '1', 1, 'false', '0', '', 0));
        }

        return "$typedValue" == "$value";
    }

    /**
     * Check for the 'type' validation rule
     *
     * A "Schema type" is almost the same as a PHP type except we have
     * "real" instead of "double"
     *
     * @param string $type - the "schema type" this field should have
     * @param mixed $value
     * @param mixed $typedValue
     *
     * @return boolean|string - either boolean true or an error message
     *
     * @SuppressWarnings(PHPMD.UnusedFormalParameter)
     * @SuppressWarnings(PHPMD.UnusedPrivateMethod)
     */
    private function checkType($type, $value, $typedValue)
    {
        return $this->isCorrectType(
            $type,
            $value,
            $typedValue
        ) ? true : "should be $type";
    }

    /**
     * Check for the 'mustEqual' validation rule
     *
     * @param mixed $checkValue - the value this field must have
     * @param mixed $value
     * @param mixed $typedValue
     *
     * @return boolean|string - either boolean true or an error message
     *
     * @SuppressWarnings(PHPMD.UnusedFormalParameter)
     * @SuppressWarnings(PHPMD.UnusedPrivateMethod)
     */
    private function checkMustEqual($checkValue, $value, $typedValue)
    {
        return $typedValue === $checkValue ? true : 'invalid';
    }

    /**
     * Check for the 'minValue' validation rule
     *
     * @param mixed $minimum - the minimum value this field must have
     * @param mixed $value
     * @param mixed $typedValue
     *
     * @return boolean|string - either boolean true or an error message
     *
     * @SuppressWarnings(PHPMD.UnusedFormalParameter)
     * @SuppressWarnings(PHPMD.UnusedPrivateMethod)
     */
    private function checkMinValue($minimum, $value, $typedValue)
    {
        return $typedValue >= $minimum ? true : "should be at least $minimum";
    }

    /**
     * Check for the 'maxValue' validation rule
     *
     * @param mixed $maximum - the maximum value this field must have
     * @param mixed $value
     * @param mixed $typedValue
     *
     * @return boolean|string - either boolean true or an error message
     *
     * @SuppressWarnings(PHPMD.UnusedFormalParameter)
     * @SuppressWarnings(PHPMD.UnusedPrivateMethod)
     */
    private function checkMaxValue($maximum, $typedValue)
    {
        return $typedValue <= $maximum ? true : "should be at most $maximum";
    }

    /**
     * Check for the 'greaterThan' validation rule
     *
     * @param mixed $otherArgument - field to compare this one against
     * @param mixed $value
     * @param mixed $typedValue
     *
     * @return boolean|string - either boolean true or an error message
     *
     * @SuppressWarnings(PHPMD.UnusedFormalParameter)
     * @SuppressWarnings(PHPMD.UnusedPrivateMethod)
     */
    private function checkGreaterThan($otherArgument, $value, $typedValue)
    {
        return $typedValue > $this->schema->typedParameter(
            $otherArgument,
            $this->postData
        ) ? true : "must be greater than $otherArgument";
    }

    /**
     * Check for the 'lessThan' validation rule
     *
     * @param mixed $otherArgument - field to compare this one against
     * @param mixed $value
     * @param mixed $typedValue
     *
     * @return boolean|string - either boolean true or an error message
     *
     * @SuppressWarnings(PHPMD.UnusedFormalParameter)
     * @SuppressWarnings(PHPMD.UnusedPrivateMethod)
     */
    private function checkLessThan($otherArgument, $value, $typedValue)
    {
        return $typedValue < $this->schema->typedParameter(
            $otherArgument,
            $this->postData
        ) ? true : "must be less than $otherArgument";
    }

    ////////////////////////////////////////////////////////////////////////////

    private function isRequired($rules, $value)
    {
        $required = $rules['required'];

        if ($required === 'optional') {
            return $this->schema->typedValue('string', $value) != '';
        }

        return $this->schema->checkBooleanOption($required, $this->postData);
    }
}
