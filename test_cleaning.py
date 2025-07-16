import pandas as pd

def clean_numeric_value(value):
    if pd.isna(value):
        return 0.0
    
    # Convert to string and clean
    str_val = str(value).strip()
    
    # Remove any quotes and parentheses artifacts
    str_val = str_val.replace('"', '').replace('(', '').replace(')', '')
    
    # If it contains multiple numbers (like '31.1 35.3'), take the first one
    if ' ' in str_val:
        str_val = str_val.split()[0]
    
    # Try to convert to float
    try:
        return float(str_val)
    except (ValueError, TypeError):
        return 0.0

# Test with the actual values we found for ZIP 11368
test_values = ['15.6', ' 16.7)"', '"(38.0', '3.2', '"(17.4']
print('Testing data cleaning function:')
for val in test_values:
    cleaned = clean_numeric_value(val)
    print(f'Original: "{val}" -> Cleaned: {cleaned}')

print('\nExpected results:')
print('15.6 should become 15.6')
print(' 16.7)" should become 16.7') 
print('"(38.0 should become 38.0')
print('3.2 should become 3.2')
print('"(17.4 should become 17.4')
