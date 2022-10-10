<?php

namespace SynchWeb\Model;

class User
{
    public string $loginId;
    public int $personId;
    public string $givenName;
    public string $familyName;
    private array $perms;
    private array $groups;
    private array $cache;

    private $allowed_caches = array('shipment', 'container');

    function __construct(string $loginId, int $personId, string $givenName, string $familyName, array $permissions, array $groups, array $cache = array())
    {
        $this->loginId = $loginId;
        $this->personId = $personId;
        $this->givenName = $givenName;
        $this->familyName = $familyName;
        $this->perms = $permissions;
        $this->groups = $groups;
        $this->cache = $cache;
    }

    function hasPermissions($permission)
    {
        return in_array($permission, $this->perms);
    }

    function isInGroup($group)
    {
        return in_array($group, $this->groups);
    }

    // User cache - for saving partially filled forms, etc
    function getFromCache($key)
    {
        return array_key_exists($key, $this->cache) ? $this->cache[$key] : null;
    }

    function setInCache($key, $data)
    {
        if (in_array($key, $this->allowed_caches)) {
            $this->cache[$key] = $data;

            return true;
        }
        return false;
    }

    function __toString()
    {
        return $this->loginId;
    }

    # For JSONing a user
    function __toArray()
    {
        return array('login' => $this->loginId, 'personid' => $this->personId, 'permissions' => $this->perms);
    }
}