# Examples

## Data Source

```xml
<Data>
    <Record id="1">
        <FirstName>Jane</FirstName>
        <LastName>Doe</LastName>
        <SpecialAccess>1</SpecialAccess>
        <Picture>imgs/001.jpg</Picture>
    </Record>
    <Record id="2">
        <FirstName>John</FirstName>
        <LastName>Smith</LastName>
        <Picture>imgs/002.jpg</Picture>
    </Record>
</Data>
```

## Example 1
Output _FirstName<SPACE>LastName_ of the first record

```
${=Record[1]/FirstName} ${=Record[1]/LastName}
```

## Example 2
Output _FirstName<SPACE>LastName_ of all records

```
${*Record}${=FirstName} ${=LastName}${.}
```

# Example 3
Output _FirstName<SPACE>LastName_ of all records. Suffix with _(SA)_ if user has SpecialAccess or _(NA)_ if user does not have special access.

```
${*Record}${=FirstName} ${=LastName} ${?SpecialAccess=1}(SA)${:}(NA)${.}${.}
```

# Example 4
Output _FirstName<SPACE>LastName_ of all records but declare the outputting part as a reusable Component.

```
${*Record}${@Comp1}${.}
${#Comp1}${=FirstName} ${=LastName}${.}
```

# Example 5

Output the picture of the first record to a picture fame named _ProfilePic_

```
${=Record[1]/Picture,ProfilePic}
```