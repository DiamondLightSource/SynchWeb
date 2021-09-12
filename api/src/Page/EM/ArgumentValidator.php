<?php

namespace SynchWeb\Page\EM;

/**
 * Validate the arguments passed for processing job parameters
 *
 * Some of this validation is handled by The Slim Framework's
 * argument pattern matching in api/src/Page/EM.php.
 * If at some point Slim was abandoned, then that pattern matching would have
 * to be moved here too.
 */
class ArgumentValidator
{
    private $args;
    private $schema;

    public function __construct($schema)
    {
        $this->schema = $schema;
    }

    public function validateArguments($args)
    {
        $this->args = $args;
        $invalid = array();

        foreach ($this->schema as $name => $rules) {
            $result = $this->validateArgument($name, $rules);
            if ($result !== true) {
                array_push($invalid, array(
                    'field' => $name,
                    'message' => $result
                ));
            }
        }

        return $invalid;
    }

    protected function validateArgument($name, $rules)
    {
        $value = $this->getArgumentValue($name);

        if ($this->isRequired($rules) && in_array($value, array('', null))) {
            return "this value is missing";
        }

        if (
            !array_key_exists('validateOptions', $rules) ||
            $rules['validateOptions']
        ) {
            $rule = array_key_exists('options', $rules) ? $rules['options'] : null;

            if ($rule !== null && !in_array($value, $rule)) {
                return "$value is not known";
            }
        }

        $rule = array_key_exists('checkType', $rules) ? $rules['checkType'] : null;

        if ($rule !== null) {
            if ($this->notType($value, $rule)) {
                return "should be $rule";
            }

            $value = $this->setType($value, $rule);
        }

        $rule = array_key_exists('mustEqual', $rules) ? $rules['mustEqual'] : null;

        if ($rule !== null && $value !== $rule) {
            return "invalid";
        }

        $rule = array_key_exists('minValue', $rules) ? $rules['minValue'] : null;

        if ($rule !== null && $value < $rule) {
            return "too small";
        }

        $rule = array_key_exists('maxValue', $rules) ? $rules['maxValue'] : null;

        if ($rule !== null && $value > $rule) {
            return "too large";
        }

        return true;
    }

    private function isRequired($rules)
    {
        // no array_key_exists because this one must exist on all schema entries
        $required = $rules['required'];
        if (gettype($required) == 'boolean') {
            return $required;
        }

        foreach ($required as $otherArgument => $expectedValue) {
            $otherValue = $this->getTypedValue($otherArgument);
            // all checks must be true for required to be true
            if ($otherValue !== $expectedValue) {
                return false;
            }
        }

        return true;
    }

    private function notType($value, $type)
    {
        if ($type == 'boolean') {
            return !in_array($value, array('true', '1', 1, 'false', '0', '', 0));
        }

        $check = $value;
        settype($check, $type);
        return strval($check) !== $value;
    }

    private function setType($value, $type)
    {
        if ($type == 'boolean') {
            return in_array($value, array('true', '1'));
        }

        $new = $value;
        settype($new, $type);
        return $new;
    }

    private function getArgumentValue($name)
    {
        return array_key_exists($name, $this->args) ? $this->args[$name] : null;
    }

    private function getTypedValue($name)
    {
        $value = $this->getArgumentValue($name);
        $rules = $this->schema[$name];
        if (array_key_exists('checkType', $rules)) {
            $value = $this->setType($value, $rules['checkType']);
        }
        return $value;
    }
}
