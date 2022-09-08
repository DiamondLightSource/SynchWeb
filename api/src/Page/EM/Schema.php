<?php

namespace SynchWeb\Page\EM;

abstract class Schema
{
    protected $allRules;

    /**
     * Return the name of the default table for all fields that don't have one
     *
     * @return string
     */
    abstract protected function defaultTable();

    /**
     * Provide the schema for server-side use
     *
     * Array keyed by field name, each containing some or all of the following keys:
     *
     * 'label'            => human readable label,
     * 'unit'             => (e.g. ),  "Å/pixel", "kV"
     * 'extraDescription' => Extra human readable description
     * 'display'          => true, false or 'notBlank'
     *                       indicate if the value should be displayed in the UI
     * 'default'          => default value,
     *
     * validation options
     * 'required'         => a boolean field or a string with the value
     *                       "optional" - the field can be blank but it will
     *                       still be used
     * 'options'          => list of option values for option lists,
     * 'displayOptions'   => alternate option list for display,
     * 'pattern'          => pattern for validation ("filename", "directory"),
     * 'minValue'         => minimum value,
     * 'maxValue'         => maximum value,
     * 'type'             => check value is type ("boolean", "integer", "real")
     * 'lessThan'         => another field that this one must be less than,
     * 'greaterThan'      => another field that this one must be greater than,
     *
     * used by API only
     * 'select'           => select clause to get this field
     * 'stored'           => a boolean field - if it evaluates to zero
     *                       the field should not be inserted or selected
     *                       TODO: how can you use this in a SELECT when the
     *                       other fields the boolean may depend on aren't
     *                       available yet?
     * 'onSelect'         => PHP function to transform selected data
     * 'onUpdate'         => PHP function to transform data prior to insert
     *
     * If a field above is described as having a boolean option, the value can
     * be either true or false (a boolean or a string) or an array keyed by
     * other fields with an expected value. e.g.:
     * 'required' => array(
     *     'firstField' => 'true',
     *     'secondField' => 10,
     * )
     * indicates the given field is only required if 'firstField' is true and
     * secondField is 10, otherwise the given field is not required.
     *
     * @return array
     */

    abstract public function schema();

    ////////////////////////////////////////////////////////////////////////////

    public function __construct()
    {
        $this->allRules = $this->schema();
    }

    public function ruleSet()
    {
        return $this->allRules;
    }

    /**
     * Post process a row SELECTed from the database
     *
     * @param array $row
     *
     * @return array
     */
    public function processRow($row)
    {
        $processedRow = array_map(
            function ($value) {
                return strval($value);
            },
            $row
        );
        foreach ($this->allRules as $fieldName => $rules) {
            if (array_key_exists('onSelect', $rules)) {
                $processedRow[$fieldName] = call_user_func(
                    $rules['onSelect'],
                    $row
                );
            }
        }
        return $processedRow;
    }

    /**
     * List of fields for an SQL SELECT query
     *
     * @return string[]
     */
    public function selections()
    {
        $selections = array();
        foreach ($this->allRules as $fieldName => $rules) {
            $selection = $this->selection($fieldName, $rules);
            if ($selection) {
                $selections[] = $selection;
            }
        }

        return $selections;
    }

    /**
     * Single field for an SQL SELECT query
     *
     * @param string $fieldName
     * @param array $rules - schema rules for the named field
     *
     * @return string - SQL SELECT clause item
     */
    private function selection($fieldName, $rules)
    {
        if (array_key_exists('select', $rules)) {
            return $rules['select'] . ' AS ' . $fieldName;
        }
        if (array_key_exists('stored', $rules) && $rules['stored'] === false) {
            return false;
        }
        return $this->defaultTable() . '.' . $fieldName;
    }

    ////////////////////////////////////////////////////////////////////////////

    /**
     * Options such as required and stored can reference the values of
     * other fields to determine their boolean value
     *
     * @param string|array $rule
     * @param array $postData
     *
     * @return boolean
     */
    public function checkBooleanOption($rule, $postData)
    {
        if (gettype($rule) != 'array') {
            return $this->typedValue('boolean', $rule);
        }

        foreach ($rule as $otherArgument => $expectedValue) {
            $actualValue = $this->typedParameter($otherArgument, $postData);
            $matched = gettype($expectedValue) == 'array' ?
                in_array($actualValue, $expectedValue) :
                $actualValue === $expectedValue;
            if (!$matched) {
                return false;
            }
        }

        return true;
    }

    /**
     * Type coerce the given value
     *
     * @param string $type
     * @param mixed $value - the value to coerce
     *
     * @return mixed - the value coerced into the given type
     */
    public function typedValue($type, $value)
    {
        if ($type == 'boolean') {
            return in_array($value, array('true', '1'));
        }

        $phpType = $type == 'real' ? 'double' : $type;

        $new = $value;
        settype($new, $phpType);
        return $new;
    }

    /**
     * Get the expected type of a field.
     *
     * @param string $fieldName
     * @param array $theData
     *
     * @return mixed
     */
    public function typedParameter($fieldName, $theData)
    {
        $rules = $this->allRules[$fieldName];
        $type = array_key_exists('type', $rules) ? $rules['type'] : 'string';
        return $this->typedValue($type, $theData[$fieldName]);
    }

    ////////////////////////////////////////////////////////////////////////////

    /**
     * Provide a list of key value pairs for inserting
     *
     * @param array $raw - data to insert
     * @param array $prepared - any pre-set data already prepared for insert
     *
     * @return array
     */
    public function prepareDataForInsert($raw, $prepared = array())
    {
        $schema = $this->allRules;
        foreach ($raw as $fieldName => $value) {
            if (array_key_exists($fieldName, $prepared)) {
                continue;
            }
            $rules = $schema[$fieldName];
            if (array_key_exists('stored', $rules)) {
                $stored = $this->checkBooleanOption(
                    $rules['stored'],
                    $raw
                );
                if (!$stored) {
                    continue;
                }
            }
            if (gettype($value) == 'boolean') {
                $value = $value ? 1 : 0;
            }
            $prepared[$fieldName] = $value;
        }
        foreach ($schema as $fieldName => $rules) {
            if (array_key_exists('onUpdate', $rules)) {
                $prepared[$fieldName] = call_user_func(
                    $rules['onUpdate'],
                    $raw
                );
            }
        }
        return $prepared;
    }

    /**
     * Provide a list of field names to be inserted, a placeholder string, and an array of values
     *
     * @param array $raw - data to insert
     * @param array $prePrepared - any pre-set data already prepared for insert
     *
     * @return array
     */
    public function inserts($raw, $prePrepared = array())
    {
        $prepared = $this->prepareDataForInsert($raw, $prePrepared);
        $values = array_values($prepared);
        return array(
            'fieldNames' => implode(',', array_keys($prepared)),
            'values' => $values,
            'placeholders' => implode(',', array_map(
                function ($number) {
                    return ':' . ($number + 1);
                },
                array_keys($values)
            ))
        );
    }

    ////////////////////////////////////////////////////////////////////////////

    /**
     * A version of the schema useful on client side with some fields redacted
     *
     * @return array
     */
    public function clientSchema()
    {
        $hiddenRules = array(
            'select',
            'stored',
            'onSelect',
            'onUpdate',
        );
        $clientSchema = array();
        foreach ($this->allRules as $fieldName => $rules) {
            $clientRules = array();
            foreach ($rules as $ruleName => $ruleData) {
                if (!in_array($ruleName, $hiddenRules)) {
                    $clientRules[$ruleName] = $ruleData;
                }
            }
            if (count($clientRules) > 0) {
                $clientSchema[$fieldName] = $clientRules;
            }
        }
        return $clientSchema;
    }
}
