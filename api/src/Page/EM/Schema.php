<?php

namespace SynchWeb\Page\EM;

abstract class Schema
{
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
     * human readable info.
     *
     * 'label'            => human readable label,
     * 'unit'             => (e.g. ),  "Å/pixel", "kV"
     * 'extraDescription' => Extra human readable description
     *
     * validation options
     * 'required'         => true = value is required, false = value will be ignored
     *                       *OR* an array of other field names and given values
     *                       that, if true, make this field required
     *                       e.g. ['anotherField' => 10]
     *                       this field is required if anotherField == 10
     *                       *OR* "optional" the field can be blank but it will
     *                       be stored
     * 'default'          => default value,
     * 'options'          => list of option values for SELECTs,
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
     * 'stored'           => true = field is stored / false = for info only,
     * 'onSelect'         => PHP function to transform selected data
     * 'onUpdate'         => PHP function to transform data prior to update/insert
     *
     * https://www.youtube.com/watch?v=1s-BGBA8Nqo
     *
     * @return array
     */

    abstract public function schema();

    ////////////////////////////////////////////////////////////////////////////

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
        foreach ($this->schema() as $fieldName => $rules) {
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
        foreach ($this->schema() as $fieldName => $rules) {
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
        if (array_key_exists('stored', $rules) && !$rules['stored']) {
            return false;
        }
        return $this->defaultTable() . '.' . $fieldName;
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
    public function preparePostData($raw, $prepared = array())
    {
        $schema = $this->schema();
        foreach ($raw as $fieldName => $value) {
            if (array_key_exists($fieldName, $prepared)) {
                continue;
            }
            $rules = $schema[$fieldName];
            if (
                array_key_exists('stored', $rules) &&
                !$rules['stored']
            ) {
                continue;
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
        $prepared = $this->prepareData($raw, $prePrepared);
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
        foreach ($this->schema() as $fieldName => $rules) {
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
