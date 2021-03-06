describe('HTML', function(){

  function expectHTML(html) {
    return expect(new HTML(html).get());
  }

  it('should echo html', function(){
    expectHTML('hello<b class="1\'23" align=\'""\'>world</b>.').
       toEqual('hello<b class="1\'23" align="&quot;&quot;">world</b>.');
  });

  it('should remove script', function(){
    expectHTML('a<SCRIPT>evil< / scrIpt >c.').toEqual('ac.');
  });

  it('should remove nested script', function(){
    expectHTML('a< SCRIPT >A< SCRIPT >evil< / scrIpt >B< / scrIpt >c.').toEqual('ac.');
  });

  it('should remove attrs', function(){
    expectHTML('a<div style="abc">b</div>c').toEqual('a<div>b</div>c');
  });

  it('should remove style', function(){
    expectHTML('a<STyle>evil</stYle>c.').toEqual('ac.');
  });

  it('should remove script and style', function(){
    expectHTML('a<STyle>evil<script></script></stYle>c.').toEqual('ac.');
  });

  it('should remove double nested script', function(){
    expectHTML('a<SCRIPT>ev<script>evil</sCript>il</scrIpt>c.').toEqual('ac.');
  });

  it('should remove unknown tag names', function(){
    expectHTML('a<xxx><B>b</B></xxx>c').toEqual('a<b>b</b>c');
  });

  it('should remove unsafe value', function(){
    expectHTML('<a href="javascript:alert()">').toEqual('<a></a>');
  });

  it('should handle self closed elements', function(){
    expectHTML('a<hr/>c').toEqual('a<hr/>c');
  });

  it('should handle namespace', function(){
    expectHTML('a<my:hr/><my:div>b</my:div>c').toEqual('abc');
  });

  it('should handle improper html', function(){
    expectHTML('< div id="</div>" alt=abc href=\'"\' >text< /div>').
      toEqual('<div id="&lt;/div&gt;" alt="abc" href="&quot;">text</div>');
  });

  it('should handle improper html2', function(){
    expectHTML('< div id="</div>" / >').
      toEqual('<div id="&lt;/div&gt;"/>');
  });

  describe('htmlSanitizerWriter', function(){
    var writer, html;
    beforeEach(function(){
      html = '';
      writer = htmlSanitizeWriter({push:function(text){html+=text;}});
    });

    it('should write basic HTML', function(){
      writer.chars('before');
      writer.start('div', {id:'123'}, false);
      writer.chars('in');
      writer.end('div');
      writer.chars('after');

      expect(html).toEqual('before<div id="123">in</div>after');
    });

    it('should escape text nodes', function(){
      writer.chars('a<div>&</div>c');
      expect(html).toEqual('a&lt;div&gt;&amp;&lt;/div&gt;c');
    });

    it('should not double escape entities', function(){
      writer.chars('&nbsp;&gt;&lt;');
      expect(html).toEqual('&nbsp;&gt;&lt;');
    });

    it('should escape IE script', function(){
      writer.chars('&{}');
      expect(html).toEqual('&amp;{}');
    });

    it('should escape attributes', function(){
      writer.start('div', {id:'\"\'<>'});
      expect(html).toEqual('<div id="&quot;\'&lt;&gt;">');
    });

    it('should ignore missformed elements', function(){
      writer.start('d>i&v', {});
      expect(html).toEqual('');
    });

    it('should ignore unknown attributes', function(){
      writer.start('div', {unknown:""});
      expect(html).toEqual('<div>');
    });

    describe('javascript URL attribute', function(){
      beforeEach(function(){
        this.addMatchers({
          toBeValidUrl: function(){
            return !isJavaScriptUrl(this.actual);
          }
        });
      });

      it('should ignore javascript:', function(){
        expect('JavaScript:abc').not.toBeValidUrl();
        expect(' \n Java\n Script:abc').not.toBeValidUrl();
        expect('JavaScript/my.js').toBeValidUrl();
      });

      it('should ignore dec encoded javascript:', function(){
        expect('&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;').not.toBeValidUrl();
        expect('&#106&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;').not.toBeValidUrl();
        expect('&#106 &#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;').not.toBeValidUrl();
      });

      it('should ignore decimal with leading 0 encodede javascript:', function(){
        expect('&#0000106&#0000097&#0000118&#0000097&#0000115&#0000099&#0000114&#0000105&#0000112&#0000116&#0000058').not.toBeValidUrl();
        expect('&#0000106 &#0000097&#0000118&#0000097&#0000115&#0000099&#0000114&#0000105&#0000112&#0000116&#0000058').not.toBeValidUrl();
        expect('&#0000106; &#0000097&#0000118&#0000097&#0000115&#0000099&#0000114&#0000105&#0000112&#0000116&#0000058').not.toBeValidUrl();
      });

      it('should ignore hex encoded javascript:', function(){
        expect('&#x6A&#x61&#x76&#x61&#x73&#x63&#x72&#x69&#x70&#x74&#x3A;').not.toBeValidUrl();
        expect('&#x6A;&#x61&#x76&#x61&#x73&#x63&#x72&#x69&#x70&#x74&#x3A;').not.toBeValidUrl();
        expect('&#x6A &#x61&#x76&#x61&#x73&#x63&#x72&#x69&#x70&#x74&#x3A;').not.toBeValidUrl();
      });

      it('should ignore hex encoded whitespace javascript:', function(){
        expect('jav&#x09;ascript:alert("A");').not.toBeValidUrl();
        expect('jav&#x0A;ascript:alert("B");').not.toBeValidUrl();
        expect('jav&#x0A ascript:alert("C");').not.toBeValidUrl();
        expect('jav\u0000ascript:alert("D");').not.toBeValidUrl();
        expect('java\u0000\u0000script:alert("D");').not.toBeValidUrl();
        expect(' &#14; java\u0000\u0000script:alert("D");').not.toBeValidUrl();
      });
    });

  });

});
