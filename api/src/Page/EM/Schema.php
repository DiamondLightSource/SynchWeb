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
     *
     * @return array
     */

    abstract public function schema();

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

    /**
     * Provide a list of field names to be inserted, a placeholder string, and an array of values
     *
     * @param $data array - data to insert
     * @param $inserts - any pre-set data already prepared for insert
     *
     * @return array
     */
    public function inserts($data, $inserts)
    {
        $schema = $this->schema();
        foreach ($data as $fieldName => $value) {
            if (array_key_exists($fieldName, $inserts)) {
                continue;
            }
            $rules = $schema[$fieldName];
            if (array_key_exists('select', $rules)) {
                continue;
            }
            if (
                array_key_exists('stored', $rules) &&
                !$rules['stored']
            ) {
                continue;
            }
            if (gettype($value) == 'boolean') {
                $value = $value ? 1 : 0;
            }
            $inserts[$fieldName] = $value;
        }

        $values = array_values($inserts);
        return array(
            'fieldNames' => implode(',', array_keys($inserts)),
            'values' => $values,
            'placeholders' => implode(',', array_map(
                function ($number) {
                    return ':' . ($number + 1);
                },
                array_keys($values)
            ))
        );
    }

    /**
     * A version of the schema useful on client side with some fields redacted
     *
     * @return array
     */
    public function clientSchema()
    {
        return array_map(
            function ($field) {
                // You can't filter on an array key in PHP 5.4
                $rules = array();
                foreach ($field as $key => $value) {
                    if (!in_array($key, array('select', 'stored'))) {
                        $rules[$key] = $value;
                    }
                }
                return $rules;
            },
            $this->schema()
        );
    }
}
