<?php

namespace SynchWeb\Page\EM;

abstract class ArgumentValidator
{
    protected $args;
    protected $validationRules;
    protected $validArguments;
    protected $invalidArguments;

    abstract protected function updateRulesFromArguments();
    abstract protected function defaultRules();

    private function validateArguments()
    {
        $this->defaultRules();
        $this->updateRulesFromArguments();
        $this->validArguments = array();
        $this->invalidArguments = array();

        foreach ($this->validationRules as $argumentName => $rules) {
            // Determine whether request includes argument
            if (!$this->hasArgument($argumentName)) {
                // Check whether a missing parameter is required.
                if (array_key_exists('isRequired', $rules) && $rules['isRequired']) {
                    $this->addError("$argumentName is required");
                }
                continue;
            }

            if ($this->checkArgument($argumentName, '') {
                $this->addError("$argumentName is not specified");
                continue;
            }
            if (
                array_key_exists('minValue', $rules) &&
                $this->args[$argumentName] < $rules['minValue']
            ) {
                $this->addError("$argumentName is too small");
                continue;
            }
            if (
                array_key_exists('maxValue', $rules) &&
                $this->args[$argumentName] > $rules['maxValue']
            ) {
                $this->addError("$argumentName is too large");
                continue;
            }
            if (
                array_key_exists('inArray', $rules) &&
                is_array($rules['inArray']) &&
                !in_array($this->args[$argumentName], $rules['inArray'])
            ) {
                $this->addError("$argumentName is not known");
                continue;
            }
            // Argument has passed validation checks so add to list of valid arguments.
            $this->validArguments[$argumentName] = $this->args[$argumentName];
            // Set type if outputType is specified, otherwise default to string.
            // Note json_encode quotes value of type string.
            $outputType = array_key_exists('outputType', $rules) ?
                $rules['outputType'] : 'string';
            settype($validArguments[$argumentName], $outputType);

            return array($invalidArguments, $validArguments);
        }
    }

    private function addError($message) {
        array_push($this->invalidArguments, $message);
    }

    /**
     * Add additional required clauses to validation rules
     *
     * @SuppressWarnings(PHPMD.UnusedLocalVariable)
     */
    protected function updateRequiredArguments(array $requiredArguments)
    {
        foreach ($this->validationRules as $argument => $rule) {
            // Determine whether parameter is in array of required arguments
            if (in_array($argument, $requiredArguments)) {
                // Update validation rule
                $this->validationRules[$argument]['isRequired'] = true;
            }
        }
    }

    protected function hasArgument($argumentName)
    {
        return array_key_exists($argumentName, $this->args);
    }

    protected function checkArgument($argumentName, $expectedValue = true)
    {
        return $this->hasArgument($argumentName) &&
            $this->args[$argumentName] === $expectedValue;
    }
}
