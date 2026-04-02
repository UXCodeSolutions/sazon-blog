import re

def run():
    with open('script.js', 'r') as f:
        content = f.read()

    # Change the declaration
    content = content.replace('const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);', 
                              'const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);')
    
    # Change usages like supabase.auth, supabase.from
    # We want to replace "supabase." with "supabaseClient."
    # But ONLY when it's not "window.supabase." and not ".supabase.co"
    lines = content.split('\n')
    for i in range(len(lines)):
        line = lines[i]
        
        # Don't touch the declaration line or url line
        if 'window.supabase.' in line or '.supabase.co' in line:
            continue
            
        # Replace variable usages
        # Use regex to replace 'supabase.' preceded by whitespace, brackets, or await
        line = re.sub(r'(?<![a-zA-Z0-9_])supabase\.', 'supabaseClient.', line)
        lines[i] = line
        
    with open('script.js', 'w') as f:
        f.write('\n'.join(lines))

if __name__ == '__main__':
    run()
