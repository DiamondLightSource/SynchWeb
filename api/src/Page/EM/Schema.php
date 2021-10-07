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
     */

    abstract public function schema();

    /**
     * List of fields for an SQL select command
     */
    public function selections()
    {
        $table = $this->defaultTable();
        $fields = array();
        foreach ($this->schema() as $fieldName => $rules) {
            if (array_key_exists('stored', $rules) && $rules['stored'] == false) {
                continue;
            }

            $select = array_key_exists('select', $rules) ?
                $rules['select'] : false;

            $fields[] = $select ? "$select AS $fieldName" : "$table.$fieldName";
        }

        return $fields;
    }

    /**
     * A version of the schema useful on client side with some fields redacted
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
