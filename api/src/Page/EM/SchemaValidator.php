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
        $required = array();

        foreach ($this->schema as $name => $rules) {
            $value = $this->postedValue($name);

            if (!$this->isRequired($rules, $value)) {
                continue;
            }

            $result = $this->validateArgument($value, $rules);
            if ($result === true) {
                $required[$name] = $value;
                continue;
            }

            $invalid[$name] = $result;
        }

        return array($invalid, $required);
    }

    private function decodeJson($json)
    {
        $data = json_decode($json, true);
        return gettype($data) == 'array' ? $data : array();
    }

    protected function validateArgument($value, $rules)
    {
        foreach ($rules as $ruleName => $rule) {
            $constraint = 'check' . ucfirst($ruleName);
            if (method_exists($this, $constraint)) {
                $valid = call_user_func(
                    array($this, $constraint),
                    $rules,
                    $rule,
                    $value
                );
                if ($valid !== true) {
                    return $valid;
                }
            }
        }
        return true;
    }

    /**
     * Check for the 'required' validation rule
     *
     * @param array $allRules - all the rules applying to the field being checked
     * @param boolean|array $required - if an array - other fields and the value that would make this one required
     * @param mixed $value - the value of the field being checked
     *
     * @return boolean|string - either boolean true or an error message
     *
     * @SuppressWarnings(PHPMD.UnusedFormalParameter)
     * @SuppressWarnings(PHPMD.UnusedPrivateMethod)
     */
    private function checkRequired($allRules, $required, $value)
    {
        if ($required === 'optional') {
            return true;
        }

        return ($value !== '' && $value !== null) ? true : 'is required';
    }

    /**
     * Check for the 'pattern' validation rule
     *
     * @param array $allRules - all the rules applying to the field being checked
     * @param array $patternName - the name of the  pattern that the field must match
     * @param mixed $value - the value of the field being checked
     *
     * @return boolean|string - either boolean true or an error message
     *
     * @SuppressWarnings(PHPMD.UnusedPrivateMethod)
     * @SuppressWarnings(PHPMD.UnusedFormalParameter)
     */
    private function checkPattern($allRules, $patternName, $value)
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
     * @param array $allRules - all the rules applying to the field being checked
     * @param array $options - all possible values the field can have
     * @param mixed $value - the value of the field being checked
     *
     * @return boolean|string - either boolean true or an error message
     *
     * @SuppressWarnings(PHPMD.UnusedPrivateMethod)
     */
    private function checkOptions($allRules, $options, $value)
    {
        // One field with options - also allows the user to enter their own
        // value - so we have a flag to ignore validating options.
        /* TODO: make "raw folder" a free-form text field... why is it even a
           choice anyway? */
        if (
            array_key_exists('validateOptions', $allRules) &&
            $allRules['validateOptions'] == false
        ) {
            return true;
        }

        return in_array(
            "$value",
            $options,
            true
        ) ? true : "$value is not known";
    }

    /**
     * Assert that a value is of a given type
     *
     * @param string $type - the PHP type to assert
     * @param mixed $value - the value to check
     *
     * @return boolean
     */
    private function isCorrectType($type, $value)
    {
        if ($type == 'boolean') {
            return in_array($value, array('true', '1', 1, 'false', '0', '', 0));
        }

        $typedValue = $this->typedValue($type, $value);

        return "$typedValue" == "$value";
    }

    /**
     * Check for the 'type' validation rule
     *
     * @param array $allRules - all the rules applying to the field being checked
     * @param string $type - the PHP type this field should have
     * @param mixed $value - the value of the field being checked
     *
     * @return boolean|string - either boolean true or an error message
     *
     * @SuppressWarnings(PHPMD.UnusedFormalParameter)
     * @SuppressWarnings(PHPMD.UnusedPrivateMethod)
     */
    private function checkType($allRules, $type, $value)
    {
        return $this->isCorrectType(
            $type,
            $value
        ) ? true : "should be $type";
    }

    /**
     * Check for the 'mustEqual' validation rule
     *
     * @param array $allRules - all the rules applying to the field being checked
     * @param mixed $checkValue - the value this field must have
     * @param mixed $value - the value of the field being checked
     *
     * @return boolean|string - either boolean true or an error message
     *
     * @SuppressWarnings(PHPMD.UnusedPrivateMethod)
     */
    private function checkMustEqual($allRules, $checkValue, $value)
    {
        return $this->typedValue(
            $allRules,
            $value
        ) === $checkValue ? true : 'invalid';
    }

    /**
     * Check for the 'minValue' validation rule
     *
     * @param array $allRules - all the rules applying to the field being checked
     * @param mixed $minimum - the minimum value this field must have
     * @param mixed $value - the value of the field being checked
     *
     * @return boolean|string - either boolean true or an error message
     *
     * @SuppressWarnings(PHPMD.UnusedPrivateMethod)
     */
    private function checkMinValue($allRules, $minimum, $value)
    {
        return $this->typedValue(
            $allRules,
            $value
        ) >= $minimum ? true : 'too small';
    }

    /**
     * Check for the 'maxValue' validation rule
     *
     * @param array $allRules - all the rules applying to the field being checked
     * @param mixed $maximum - the maximum value this field must have
     * @param mixed $value - the value of the field being checked
     *
     * @return boolean|string - either boolean true or an error message
     *
     * @SuppressWarnings(PHPMD.UnusedPrivateMethod)
     */
    private function checkMaxValue($allRules, $maximum, $value)
    {
        return $this->typedValue(
            $allRules,
            $value
        ) <= $maximum ? true : 'too large';
    }

    /**
     * Check for the 'greaterThan' validation rule
     *
     * @param array $allRules - all the rules applying to the field being checked
     * @param mixed $otherArgument - field to compare this one against
     * @param mixed $value - the value of the field being checked
     *
     * @return boolean|string - either boolean true or an error message
     *
     * @SuppressWarnings(PHPMD.UnusedPrivateMethod)
     */
    private function checkGreaterThan($allRules, $otherArgument, $value)
    {
        return $this->typedValue(
            $allRules,
            $value
        ) > $this->typedPostedValue(
            $otherArgument
        ) ? true : "must be greater than $otherArgument";
    }

    /**
     * Check for the 'lessThan' validation rule
     *
     * @param array $allRules - all the rules applying to the field being checked
     * @param mixed $otherArgument - field to compare this one against
     * @param mixed $value - the value of the field being checked
     *
     * @return boolean|string - either boolean true or an error message
     *
     * @SuppressWarnings(PHPMD.UnusedPrivateMethod)
     */
    private function checkLessThan($allRules, $otherArgument, $value)
    {
        return $this->typedValue(
            $allRules,
            $value
        ) < $this->typedPostedValue(
            $otherArgument
        ) ? true : "must be less than $otherArgument";
    }

    ////////////////////////////////////////////////////////////////////////////

    private function isRequired($rules, $value)
    {
        if (array_key_exists('readOnly', $rules) && $rules['readOnly']) {
            return false;
        }

        $required = $rules['required'];

        if ($required === 'optional') {
            return $this->typedValue('string', $value) != '';
        }

        if (gettype($required) != 'array') {
            return $this->typedValue('boolean', $required);
        }

        foreach ($required as $otherArgument => $expectedValue) {
            // all checks must be true for required to be true
            if ($this->typedPostedValue($otherArgument) !== $expectedValue) {
                return false;
            }
        }

        return true;
    }

    private function requiredType($param)
    {
        if (gettype($param) == 'array') {
            if (!array_key_exists('type', $param)) {
                return false;
            }
            return $param['type'];
        }

        return $param;
    }

    /**
     * Type coerce the given value
     *
     * @param mixed $param - either an array of rules including a type field or a type in a string
     * @param mixed $value - the value to coerce
     *
     * @return mixed - the value coerced into the given type
     */
    private function typedValue($param, $value)
    {
        $type = $this->requiredType($param);

        if ($type == false) {
            return $value;
        }

        if ($type == 'boolean') {
            return in_array($value, array('true', '1'));
        }

        $phpType = $type == 'real' ? 'double' : $type;

        $new = $value;
        settype($new, $phpType);
        return $new;
    }

    private function postedValue($name)
    {
        return array_key_exists($name, $this->postData) ?
            $this->postData[$name] : null;
    }

    private function typedPostedValue($name)
    {
        return $this->typedValue(
            $this->schema[$name],
            $this->postedValue($name)
        );
    }
}
