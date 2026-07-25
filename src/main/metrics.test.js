const MetricsEngine = require('./metrics');

describe('MetricsEngine', () => {
    describe('categorizeApp', () => {
        let metricsEngine;
        let mockStore;

        beforeEach(() => {
            // Mock store to prevent actual file writing or errors
            mockStore = {
                saveMetrics: jest.fn(),
                addSession: jest.fn()
            };
            metricsEngine = new MetricsEngine(mockStore);
        });

        afterEach(() => {
            metricsEngine.destroy();
        });

        describe('Coding Category', () => {
            it('should categorize known coding process names as Coding', () => {
                expect(metricsEngine.categorizeApp('code.exe', 'Untitled')).toBe('Coding');
                expect(metricsEngine.categorizeApp('idea64.exe', 'Project')).toBe('Coding');
                expect(metricsEngine.categorizeApp('sublime_text.exe', 'file.txt')).toBe('Coding');
                expect(metricsEngine.categorizeApp('notepad++.exe', 'file.txt')).toBe('Coding');
                expect(metricsEngine.categorizeApp('eclipse.exe', 'workspace')).toBe('Coding');
                expect(metricsEngine.categorizeApp('devenv.exe', 'Visual Studio')).toBe('Coding');
                expect(metricsEngine.categorizeApp('WindowsTerminal.exe', 'bash')).toBe('Coding');
                expect(metricsEngine.categorizeApp('powershell.exe', 'ps')).toBe('Coding');
                expect(metricsEngine.categorizeApp('cmd.exe', 'cmd')).toBe('Coding');
                expect(metricsEngine.categorizeApp('bash.exe', 'bash')).toBe('Coding');
                expect(metricsEngine.categorizeApp('git-bash.exe', 'mingw64')).toBe('Coding');
            });

            it('should categorize known coding window titles as Coding', () => {
                expect(metricsEngine.categorizeApp('unknown.exe', 'project - VS Code')).toBe('Coding');
                expect(metricsEngine.categorizeApp('unknown.exe', 'Visual Studio 2022')).toBe('Coding');
            });
        });

        describe('Chatting Category', () => {
            it('should categorize known chatting process names as Chatting', () => {
                expect(metricsEngine.categorizeApp('slack.exe', 'General')).toBe('Chatting');
                expect(metricsEngine.categorizeApp('discord.exe', 'General')).toBe('Chatting');
                expect(metricsEngine.categorizeApp('teams.exe', 'Meeting')).toBe('Chatting');
                expect(metricsEngine.categorizeApp('whatsapp.exe', 'Chat')).toBe('Chatting');
                expect(metricsEngine.categorizeApp('messenger.exe', 'Chat')).toBe('Chatting');
                expect(metricsEngine.categorizeApp('skype.exe', 'Call')).toBe('Chatting');
                expect(metricsEngine.categorizeApp('telegram.exe', 'Group')).toBe('Chatting');
            });
        });

        describe('Writing Category', () => {
            it('should categorize known writing process names as Writing', () => {
                expect(metricsEngine.categorizeApp('winword.exe', 'Document')).toBe('Writing');
                expect(metricsEngine.categorizeApp('notion.exe', 'Notes')).toBe('Writing');
                expect(metricsEngine.categorizeApp('obsidian.exe', 'Vault')).toBe('Writing');
                expect(metricsEngine.categorizeApp('onenote.exe', 'Notebook')).toBe('Writing');
                expect(metricsEngine.categorizeApp('notepad.exe', 'Untitled')).toBe('Writing');
                expect(metricsEngine.categorizeApp('libreoffice_writer.exe', 'Document')).toBe('Writing');
                expect(metricsEngine.categorizeApp('evernote.exe', 'Note')).toBe('Writing');
            });

            it('should categorize known writing window titles as Writing', () => {
                expect(metricsEngine.categorizeApp('chrome.exe', 'Document - Google Docs')).toBe('Writing');
                expect(metricsEngine.categorizeApp('firefox.exe', 'Spreadsheet - Google Sheets')).toBe('Writing');
            });
        });

        describe('Browsing Category', () => {
            it('should categorize known browsing process names as Browsing', () => {
                // Testing with typical browser processes that do not match specific document titles
                expect(metricsEngine.categorizeApp('chrome.exe', 'New Tab')).toBe('Browsing');
                expect(metricsEngine.categorizeApp('firefox.exe', 'Mozilla')).toBe('Browsing');
                expect(metricsEngine.categorizeApp('msedge.exe', 'Microsoft Edge')).toBe('Browsing');
                expect(metricsEngine.categorizeApp('opera.exe', 'Speed Dial')).toBe('Browsing');
                expect(metricsEngine.categorizeApp('brave.exe', 'New Tab')).toBe('Browsing');
                expect(metricsEngine.categorizeApp('safari.exe', 'Start Page')).toBe('Browsing');
            });
        });

        describe('Other Category', () => {
            it('should categorize unknown processes as Other', () => {
                expect(metricsEngine.categorizeApp('explorer.exe', 'Documents')).toBe('Other');
                expect(metricsEngine.categorizeApp('spotify.exe', 'Music')).toBe('Other');
                expect(metricsEngine.categorizeApp('photoshop.exe', 'Image.psd')).toBe('Other');
                expect(metricsEngine.categorizeApp('unknown', 'unknown')).toBe('Other');
            });
        });

        describe('Edge Cases and Robustness', () => {
            it('should be case-insensitive', () => {
                expect(metricsEngine.categorizeApp('CODE.EXE', 'UNTITLED')).toBe('Coding');
                expect(metricsEngine.categorizeApp('SLACK.EXE', 'GENERAL')).toBe('Chatting');
                expect(metricsEngine.categorizeApp('WINWORD.EXE', 'DOCUMENT')).toBe('Writing');
                expect(metricsEngine.categorizeApp('CHROME.EXE', 'NEW TAB')).toBe('Browsing');
            });

            it('should handle null or undefined gracefully', () => {
                expect(metricsEngine.categorizeApp(null, null)).toBe('Other');
                expect(metricsEngine.categorizeApp(undefined, undefined)).toBe('Other');
                expect(metricsEngine.categorizeApp('', '')).toBe('Other');
            });

            it('should handle mixed inputs gracefully', () => {
                expect(metricsEngine.categorizeApp(null, 'VS Code')).toBe('Coding');
                expect(metricsEngine.categorizeApp('code.exe', null)).toBe('Coding');
            });

            it('should prioritize categories properly (Writing title over Browsing process)', () => {
                 // Even though it's chrome.exe, the title 'Google Docs' should classify it as 'Writing'
                 // In the current logic, Writing is checked before Browsing.
                 expect(metricsEngine.categorizeApp('chrome.exe', 'My Essay - Google Docs')).toBe('Writing');
            });
        });
    });
});
