"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var velite_1 = require("velite");
//----------------- Compare syllabus references across locale variants----------------------------
function areSyllabusRefsEqual(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    return a.every(function (ref, index) {
        return ref.exam === b[index].exam && ref.path === b[index].path;
    });
}
// ---------functions to validate unique content id---( Collection-level content integrity validation)-------------
function getContentFolder(path) {
    return path.replace(/\/page(?:\.hi)?$/, "");
}
function validateContentIntegrity(contents) {
    var contentIdToFolder = new Map();
    var folderToContentId = new Map();
    var seenVariants = new Set();
    var contentIdToSyllabusRefs = new Map();
    for (var _i = 0, contents_1 = contents; _i < contents_1.length; _i++) {
        var content = contents_1[_i];
        var folder = getContentFolder(content.path);
        var variantKey = "".concat(content.contentId, ":").concat(content.locale);
        // Rule 1: one contentId belongs to only one folder.
        var existingFolder = contentIdToFolder.get(content.contentId);
        if (existingFolder && existingFolder !== folder) {
            throw new Error("Content ID \"".concat(content.contentId, "\" is used in multiple folders:\n- ").concat(existingFolder, "\n- ").concat(folder));
        }
        contentIdToFolder.set(content.contentId, folder);
        // Rule 2: one folder belongs to only one contentId.
        var existingContentId = folderToContentId.get(folder);
        if (existingContentId && existingContentId !== content.contentId) {
            throw new Error("Folder \"".concat(folder, "\" contains multiple content IDs:\n- ").concat(existingContentId, "\n- ").concat(content.contentId));
        }
        folderToContentId.set(folder, content.contentId);
        // Rule 3: each contentId + locale combination must be unique.
        if (seenVariants.has(variantKey)) {
            throw new Error("Duplicate content variant: \"".concat(variantKey, "\""));
        }
        // Rule 4: same contentId → same syllabusRefs (all locale variants of the same contentId must have identical syllabus references.)
        var existingRefs = contentIdToSyllabusRefs.get(content.contentId);
        if (existingRefs &&
            !areSyllabusRefsEqual(existingRefs, content.syllabusRefs)) {
            throw new Error("Content ID \"".concat(content.contentId, "\" has inconsistent syllabus references across locale variants."));
        }
        if (!existingRefs) {
            contentIdToSyllabusRefs.set(content.contentId, content.syllabusRefs);
        }
        seenVariants.add(variantKey);
    }
}
// ------------helper function- decide hindi/english version of content------------
var getLocaleFromPath = function (path) {
    if (path.endsWith("/page.hi")) {
        return "hi";
    }
    if (path.endsWith("/page")) {
        return "en";
    }
    throw new Error("Invalid content filename: \"".concat(path, "\". Expected page.mdx or page.hi.mdx."));
};
// --------------------------------main--------------
var contents = (0, velite_1.defineCollection)({
    name: "Content",
    pattern: "**/*.mdx",
    schema: velite_1.s
        .object({
        contentId: velite_1.s.string(),
        title: velite_1.s.string(),
        syllabusRefs: velite_1.s.array(velite_1.s.object({
            exam: velite_1.s.string(),
            path: velite_1.s.string(),
        })),
        path: velite_1.s.path(),
        body: velite_1.s.mdx(),
    })
        .transform(function (data) { return (__assign(__assign({}, data), { locale: getLocaleFromPath(data.path) })); }),
});
exports.default = (0, velite_1.defineConfig)({
    root: "content",
    collections: {
        contents: contents,
    },
    prepare: function (data) {
        validateContentIntegrity(data.contents); //for checking if contentid and folder structure is unique. (Collection-level integrity validation)
    },
});
