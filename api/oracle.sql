/* Oracle Stored Proceedures */

/* TIMEDIFF - Define a function like MySQL */
CREATE OR REPLACE FUNCTION TIMEDIFF (date1 DATE, date2 DATE)
	RETURN NUMBER
IS
BEGIN
	RETURN (date1 - date2);
END;
/

/* TIME_TO_SEC - For MySQL compatability */
CREATE OR REPLACE FUNCTION TIME_TO_SEC (days NUMBER)
	RETURN NUMBER
IS
BEGIN
	RETURN (days*60*60*24);
END;
/

/* TIMESTAMPDIFF - Define a function like MySQL - For large time differences */
CREATE OR REPLACE FUNCTION TIMESTAMPDIFF (type VARCHAR2, date1 DATE, date2 DATE)
	RETURN NUMBER
IS
	multiplier NUMBER;
BEGIN
	IF type = 'SECOND' THEN
		multiplier := 24*3600;
	ELSIF type = 'MINUTE' THEN
		multiplier := 24*60;
	ELSIF type = 'HOUR' THEN
		multiplier := 24;
	ELSIF type = 'MONTH' THEN
		multiplier := 1/30.42;
	ELSE
		multiplier := 1;
	END IF;

	RETURN ROUND((date2-date1)*multiplier, 0);
END;
/
show errors

/* String aggregation string_agg(column) */
CREATE OR REPLACE TYPE t_string_agg AS OBJECT
(
  g_string  VARCHAR2(32767),

  STATIC FUNCTION ODCIAggregateInitialize(sctx  IN OUT  t_string_agg)
    RETURN NUMBER,

  MEMBER FUNCTION ODCIAggregateIterate(self   IN OUT  t_string_agg,
                                       value  IN      VARCHAR2 )
     RETURN NUMBER,

  MEMBER FUNCTION ODCIAggregateTerminate(self         IN   t_string_agg,
                                         returnValue  OUT  VARCHAR2,
                                         flags        IN   NUMBER)
    RETURN NUMBER,

  MEMBER FUNCTION ODCIAggregateMerge(self  IN OUT  t_string_agg,
                                     ctx2  IN      t_string_agg)
    RETURN NUMBER
);
/
SHOW ERRORS


CREATE OR REPLACE TYPE BODY t_string_agg IS
  STATIC FUNCTION ODCIAggregateInitialize(sctx  IN OUT  t_string_agg)
    RETURN NUMBER IS
  BEGIN
    sctx := t_string_agg(NULL);
    RETURN ODCIConst.Success;
  END;

  MEMBER FUNCTION ODCIAggregateIterate(self   IN OUT  t_string_agg,
                                       value  IN      VARCHAR2 )
    RETURN NUMBER IS
  BEGIN
    SELF.g_string := self.g_string || ',' || value;
    RETURN ODCIConst.Success;
  END;

  MEMBER FUNCTION ODCIAggregateTerminate(self         IN   t_string_agg,
                                         returnValue  OUT  VARCHAR2,
                                         flags        IN   NUMBER)
    RETURN NUMBER IS
  BEGIN
    returnValue := RTRIM(LTRIM(SELF.g_string, ','), ',');
    RETURN ODCIConst.Success;
  END;

  MEMBER FUNCTION ODCIAggregateMerge(self  IN OUT  t_string_agg,
                                     ctx2  IN      t_string_agg)
    RETURN NUMBER IS
  BEGIN
    SELF.g_string := SELF.g_string || ',' || ctx2.g_string;
    RETURN ODCIConst.Success;
  END;
END;
/
SHOW ERRORS


CREATE OR REPLACE FUNCTION string_agg (p_input VARCHAR2)
RETURN VARCHAR2
PARALLEL_ENABLE AGGREGATE USING t_string_agg;
/
SHOW ERRORS