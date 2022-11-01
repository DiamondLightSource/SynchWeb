<?php declare(strict_types=1);

namespace SynchWeb\Model\Services;

function setupPagingParameters(&$args, $perPage, $startPage = null)
{
    $start = 0;
    $end = $perPage;
    if ($startPage && $startPage > 0)
    {
        $pg = $startPage - 1;
        $start = $pg * $perPage;
        $end = $pg * $perPage + $perPage;
    }
    array_push($args, $start);
    array_push($args, $end);
}