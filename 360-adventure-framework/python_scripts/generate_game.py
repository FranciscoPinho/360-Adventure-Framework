from yattag import Doc,indent
import os
import sys

__location__ = os.path.realpath(
    os.path.join(os.getcwd(), os.path.dirname(__file__)))

doc, tag, text = Doc().tagtext()
f = open(os.path.join(sys.argv[1], 'index.html'),"w+")
with tag('html'):
    with tag('body'):
        with tag('p', id = 'main'):
            text('some text')
        with tag('a', href='/my-url'):
            text('some link')
result = indent(
    doc.getvalue(),
    indentation = '    ',
    newline = '\r\n',
    indent_text = True
)
f.write(result)
f.close()
print(result)