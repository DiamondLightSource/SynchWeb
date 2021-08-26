<?php

namespace SynchWeb\Page\EM;

trait Pagination
{
    private function paginationArguments($args)
    {
        $perPage = $this->has_arg('per_page') ?
            $this->arg('per_page') : 15;
        $page = ($this->has_arg('page') && $this->arg('page') > 0) ?
            $this->arg('page') - 1 : 0;

        array_push($args, $page * $perPage); // Offset
        array_push($args, $perPage);         // Row Count

        return $args;
    }
}
