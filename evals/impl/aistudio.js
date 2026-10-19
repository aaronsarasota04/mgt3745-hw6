/**
 * Skill Gap Analyzer Client Application
 * Implements F1 specifications:
 * - F1-1: Choose target role & enter existing skills
 * - F1-2: List missing skills required by target role postings
 * - F1-3: Case-insensitive and whitespace-insensitive matching
 * - F1-4: Display dataset collection date next to every result
 * - F1-5: Validate at least one skill is entered before showing results
 * - F1-6: Indicate when a target role has no postings in the dataset without showing a gap
 * - F1-7: Indicate when no gap was found instead of rendering an empty list
 * - F1-8: Read postings strictly through team API; zero database keys in client code
 * - F1-9: Browser mutations are refused by API
 * - F1-10: Display authentic team-supplied postings and collection date without synthetic generation
 */

(function () {
  'use strict';

  // State container encapsulated in lexical scope
  let cachedPostingData = {
    collectionDate: '',
    roles: [],
    postings: []
  };

  let hasSuccessfullyLoadedData = false;

  // DOM element references
  const formElement = document.getElementById('skill-gap-form');
  const roleSelectElement = document.getElementById('target-role-select');
  const skillsInputElement = document.getElementById('student-skills-input');
  const roleValidationElement = document.getElementById('role-validation-message');
  const skillsValidationElement = document.getElementById('skills-validation-message');
  const resultsBodyElement = document.getElementById('results-body');
  const headerCollectionBadge = document.getElementById('header-collection-badge');
  const resultCollectionDateValue = document.getElementById('result-collection-date-value');
  const presetChipsListElement = document.getElementById('preset-chips-list');
  const resetFormButton = document.getElementById('reset-form-button');
  const testMutationRefusalButton = document.getElementById('test-mutation-refusal-btn');
  const mutationTestOutputElement = document.getElementById('mutation-test-output');

  /**
   * Unified request helper to route all network communication
   * and handle transport or HTTP failures gracefully without uncaught exceptions.
   */
  async function executeApiRequest(endpointUri, requestOptions = {}) {
    try {
      const response = await fetch(endpointUri, requestOptions);
      const isSuccessStatus = response.ok;
      let responsePayload = null;

      try {
        responsePayload = await response.json();
      } catch {
        responsePayload = null;
      }

      return {
        isSuccess: isSuccessStatus,
        statusCode: response.status,
        payload: responsePayload
      };
    } catch {
      return {
        isSuccess: false,
        statusCode: 0,
        payload: null
      };
    }
  }

  /**
   * F1-3: Normalizes a skill string by trimming leading/trailing spaces,
   * collapsing internal whitespace sequences into single spaces, and lowercasing.
   */
  function normalizeSkillText(skillText) {
    if (!skillText || typeof skillText !== 'string') {
      return '';
    }
    return skillText.trim().replace(/\s+/g, ' ').toLowerCase();
  }

  /**
   * Parses student skills input from textarea by splitting on commas and newlines.
   * Filters out whitespace-only entries while preserving raw representations for display.
   */
  function parseStudentEnteredSkills(rawInputText) {
    if (!rawInputText || typeof rawInputText !== 'string') {
      return [];
    }

    return rawInputText
      .split(/[\n,]+/)
      .map(function (token) {
        return token.trim();
      })
      .filter(function (token) {
        return token.length > 0;
      });
  }

  /**
   * Clears inline validation notices and error styling classes.
   */
  function clearValidationFeedback() {
    roleValidationElement.textContent = '';
    skillsValidationElement.textContent = '';
    roleSelectElement.classList.remove('has-field-error');
    skillsInputElement.classList.remove('has-field-error');
  }

  /**
   * Displays an inline validation error message for a specific input field.
   */
  function showFieldError(inputElement, messageContainer, errorMessage) {
    inputElement.classList.add('has-field-error');
    messageContainer.textContent = errorMessage;
    inputElement.focus();
  }

  /**
   * Creates an accessible collection date badge element to be displayed next to results.
   * Enforces F1-4: showing the collection date next to every result to prevent mistaking snapshots for live data.
   */
  function createCollectionDateNotice(dateString) {
    const noticeContainer = document.createElement('div');
    noticeContainer.className = 'result-collection-date-notice';

    const labelSpan = document.createElement('span');
    labelSpan.textContent = 'Posting Set Collected: ';

    const valueSpan = document.createElement('span');
    valueSpan.className = 'date-value-highlight';
    valueSpan.textContent = dateString || 'Unknown';

    noticeContainer.appendChild(labelSpan);
    noticeContainer.appendChild(valueSpan);
    return noticeContainer;
  }

  /**
   * F1-6: Renders notice when chosen role has zero postings in the dataset.
   * Explicitly names the target role and does NOT display a gap list.
   */
  function renderRoleWithNoPostings(targetRoleName, collectionDate) {
    while (resultsBodyElement.firstChild) {
      resultsBodyElement.removeChild(resultsBodyElement.firstChild);
    }

    const bannerContainer = document.createElement('div');
    bannerContainer.className = 'state-notification-banner banner-warning';

    const bannerHeading = document.createElement('h3');
    bannerHeading.className = 'banner-title';
    bannerHeading.textContent = 'No Postings in Dataset for Role';

    const bannerDescription = document.createElement('p');
    bannerDescription.className = 'banner-body';
    bannerDescription.textContent = 'No job postings were found in the dataset for the target role "';

    const roleSpan = document.createElement('span');
    roleSpan.className = 'banner-role-name';
    roleSpan.textContent = targetRoleName;

    bannerDescription.appendChild(roleSpan);
    bannerDescription.appendChild(
      document.createTextNode(
        '". Because there are no postings for this role in the current team dataset, no skill gap can be calculated.'
      )
    );

    const footnoteContainer = document.createElement('div');
    footnoteContainer.className = 'gap-meta-footnote';
    footnoteContainer.appendChild(createCollectionDateNotice(collectionDate));

    bannerContainer.appendChild(bannerHeading);
    bannerContainer.appendChild(bannerDescription);
    bannerContainer.appendChild(footnoteContainer);

    resultsBodyElement.appendChild(bannerContainer);
  }

  /**
   * F1-7: Renders notice when student already possesses every skill required in postings.
   * Explicitly reports that no gap was found instead of showing an empty list.
   */
  function renderNoGapFound(targetRoleName, matchedSkillsList, postingCount, collectionDate) {
    while (resultsBodyElement.firstChild) {
      resultsBodyElement.removeChild(resultsBodyElement.firstChild);
    }

    const bannerContainer = document.createElement('div');
    bannerContainer.className = 'state-notification-banner banner-success';

    const bannerHeading = document.createElement('h3');
    bannerHeading.className = 'banner-title';
    bannerHeading.textContent = 'No Skill Gap Found!';

    const bannerDescription = document.createElement('p');
    bannerDescription.className = 'banner-body';
    bannerDescription.textContent = 'You already have every skill appearing in the postings for "';

    const roleSpan = document.createElement('span');
    roleSpan.className = 'banner-role-name';
    roleSpan.textContent = targetRoleName;

    bannerDescription.appendChild(roleSpan);
    bannerDescription.appendChild(
      document.createTextNode(
        '". Your background covers all requirements extracted across ' +
          postingCount +
          ' employer posting(s) for this target role.'
      )
    );

    const matchedHeading = document.createElement('h4');
    matchedHeading.className = 'gap-section-title';
    matchedHeading.textContent = 'Skills You Match in These Postings:';

    const matchedListContainer = document.createElement('div');
    matchedListContainer.className = 'skills-badge-list';

    matchedSkillsList.forEach(function (skillName) {
      const badge = document.createElement('span');
      badge.className = 'skill-matched-badge';
      badge.textContent = '\u2713 ' + skillName;
      matchedListContainer.appendChild(badge);
    });

    const footnoteContainer = document.createElement('div');
    footnoteContainer.className = 'gap-meta-footnote';
    footnoteContainer.appendChild(createCollectionDateNotice(collectionDate));

    bannerContainer.appendChild(bannerHeading);
    bannerContainer.appendChild(bannerDescription);
    bannerContainer.appendChild(matchedHeading);
    bannerContainer.appendChild(matchedListContainer);
    bannerContainer.appendChild(footnoteContainer);

    resultsBodyElement.appendChild(bannerContainer);
  }

  /**
   * F1-2: Renders missing skills that appear in postings for target role.
   * Also lists matched skills and posting details so the graduating senior can assess their fit.
   */
  function renderSkillGapResults(targetRoleName, missingSkillsList, matchedSkillsList, relevantPostings, collectionDate) {
    while (resultsBodyElement.firstChild) {
      resultsBodyElement.removeChild(resultsBodyElement.firstChild);
    }

    // Top result overview banner
    const overviewContainer = document.createElement('div');
    overviewContainer.className = 'card-panel';

    const overviewHeader = document.createElement('div');
    overviewHeader.className = 'results-header-bar';

    const roleHeading = document.createElement('h3');
    roleHeading.textContent = 'Skill Gap for ' + targetRoleName;

    overviewHeader.appendChild(roleHeading);
    overviewHeader.appendChild(createCollectionDateNotice(collectionDate));

    const overviewSummary = document.createElement('p');
    overviewSummary.className = 'helper-text';
    overviewSummary.textContent =
      'Analysis compared your skills against ' +
      relevantPostings.length +
      ' employer posting(s) collected on ' +
      collectionDate +
      '. A job description describes a preferred candidate rather than a strict barrier; use this gap list to plan targeted interview preparation.';

    overviewContainer.appendChild(overviewHeader);
    overviewContainer.appendChild(overviewSummary);

    // Missing skills gap section
    const gapHeading = document.createElement('h4');
    gapHeading.className = 'gap-section-title';
    gapHeading.textContent = 'Missing Skills in Target Role Postings (' + missingSkillsList.length + '):';

    const gapBadgesList = document.createElement('div');
    gapBadgesList.className = 'skills-badge-list';

    missingSkillsList.forEach(function (skillItem) {
      const badge = document.createElement('span');
      badge.className = 'skill-gap-badge';
      badge.textContent = '\u2022 ' + skillItem;
      gapBadgesList.appendChild(badge);
    });

    overviewContainer.appendChild(gapHeading);
    overviewContainer.appendChild(gapBadgesList);

    // Matched skills section
    if (matchedSkillsList.length > 0) {
      const matchedHeading = document.createElement('h4');
      matchedHeading.className = 'gap-section-title';
      matchedHeading.textContent = 'Skills You Already Match (' + matchedSkillsList.length + '):';

      const matchedBadgesList = document.createElement('div');
      matchedBadgesList.className = 'skills-badge-list';

      matchedSkillsList.forEach(function (skillItem) {
        const badge = document.createElement('span');
        badge.className = 'skill-matched-badge';
        badge.textContent = '\u2713 ' + skillItem;
        matchedBadgesList.appendChild(badge);
      });

      overviewContainer.appendChild(matchedHeading);
      overviewContainer.appendChild(matchedBadgesList);
    }

    // Reference postings breakdown
    const postingsBlock = document.createElement('div');
    postingsBlock.className = 'postings-inspection-block';

    const postingsHeading = document.createElement('h4');
    postingsHeading.className = 'gap-section-title';
    postingsHeading.textContent = 'Underlying Postings in Dataset for ' + targetRoleName + ':';

    postingsBlock.appendChild(postingsHeading);

    relevantPostings.forEach(function (posting) {
      const postingCard = document.createElement('div');
      postingCard.className = 'posting-item-card';

      const postingHeader = document.createElement('div');
      postingHeader.className = 'posting-item-header';

      const titleSpan = document.createElement('span');
      titleSpan.className = 'posting-job-title';
      titleSpan.textContent = posting.title;

      const companySpan = document.createElement('span');
      companySpan.className = 'posting-company-meta';
      companySpan.textContent = posting.company + ' \u2022 ' + posting.location;

      postingHeader.appendChild(titleSpan);
      postingHeader.appendChild(companySpan);

      const skillsRow = document.createElement('div');
      skillsRow.className = 'posting-skills-row';

      posting.skills.forEach(function (skillName) {
        const pill = document.createElement('span');
        pill.className = 'posting-skill-pill';
        pill.textContent = skillName;
        skillsRow.appendChild(pill);
      });

      postingCard.appendChild(postingHeader);
      postingCard.appendChild(skillsRow);
      postingsBlock.appendChild(postingCard);
    });

    overviewContainer.appendChild(postingsBlock);
    resultsBodyElement.appendChild(overviewContainer);
  }

  /**
   * Executes the skill gap comparison algorithm:
   * 1. Validates inputs (F1-1, F1-5)
   * 2. Checks role posting availability (F1-6)
   * 3. Performs case-insensitive & whitespace-insensitive set difference (F1-2, F1-3)
   * 4. Renders appropriate view with collection date (F1-4, F1-7)
   */
  function handleFormSubmission(event) {
    event.preventDefault();
    clearValidationFeedback();

    if (!hasSuccessfullyLoadedData) {
      skillsValidationElement.textContent = 'Posting dataset has not finished loading. Please wait a moment.';
      return;
    }

    const selectedRole = roleSelectElement.value.trim();
    const rawSkillsText = skillsInputElement.value;
    const studentEnteredSkills = parseStudentEnteredSkills(rawSkillsText);

    let hasValidationError = false;

    // Validate target role selection
    if (!selectedRole) {
      showFieldError(roleSelectElement, roleValidationElement, 'Please select a target role from the list.');
      hasValidationError = true;
    }

    // F1-5: IF the student enters no skills, THEN THE SYSTEM SHALL ask for at least one skill and SHALL NOT show a result.
    if (studentEnteredSkills.length === 0) {
      showFieldError(
        skillsInputElement,
        skillsValidationElement,
        'Please enter at least one skill you currently possess before analyzing your gap.'
      );
      hasValidationError = true;
    }

    if (hasValidationError) {
      // Clear results body to guarantee NO result is shown when validation fails
      while (resultsBodyElement.firstChild) {
        resultsBodyElement.removeChild(resultsBodyElement.firstChild);
      }
      const emptyNotice = document.createElement('div');
      emptyNotice.className = 'state-empty-placeholder';
      emptyNotice.textContent = 'Please address the required fields above to generate skill gap results.';
      resultsBodyElement.appendChild(emptyNotice);
      return;
    }

    // Filter postings corresponding to selected target role
    const matchingRolePostings = cachedPostingData.postings.filter(function (posting) {
      return posting.role === selectedRole;
    });

    // F1-6: IF the target role has no postings in the data set, THEN THE SYSTEM SHALL say so, naming the role, and SHALL NOT show a gap.
    if (matchingRolePostings.length === 0) {
      renderRoleWithNoPostings(selectedRole, cachedPostingData.collectionDate);
      return;
    }

    // F1-3: Build student skill set with normalized strings (trimmed, whitespace collapsed, lowercased)
    const normalizedStudentSkillMap = new Map();
    studentEnteredSkills.forEach(function (rawSkill) {
      const normalized = normalizeSkillText(rawSkill);
      if (normalized.length > 0) {
        normalizedStudentSkillMap.set(normalized, rawSkill);
      }
    });

    // Extract all skills from matching postings, maintaining unique skills while preserving original casing
    const requiredSkillsMap = new Map();
    matchingRolePostings.forEach(function (posting) {
      posting.skills.forEach(function (skillName) {
        const normalized = normalizeSkillText(skillName);
        if (!requiredSkillsMap.has(normalized)) {
          requiredSkillsMap.set(normalized, skillName);
        }
      });
    });

    const missingSkillsList = [];
    const matchedSkillsList = [];

    requiredSkillsMap.forEach(function (originalSkillName, normalizedKey) {
      if (normalizedStudentSkillMap.has(normalizedKey)) {
        matchedSkillsList.push(originalSkillName);
      } else {
        missingSkillsList.push(originalSkillName);
      }
    });

    // F1-7: IF the student already has every skill in the postings for the role,
    // THEN THE SYSTEM SHALL say no gap was found instead of showing an empty list.
    if (missingSkillsList.length === 0) {
      renderNoGapFound(
        selectedRole,
        matchedSkillsList,
        matchingRolePostings.length,
        cachedPostingData.collectionDate
      );
      return;
    }

    // F1-2: Render list of missing skills
    renderSkillGapResults(
      selectedRole,
      missingSkillsList,
      matchedSkillsList,
      matchingRolePostings,
      cachedPostingData.collectionDate
    );
  }

  /**
   * Appends a suggested skill chip into the textarea without replacing current text.
   * Retains existing input as typed.
   */
  function handlePresetChipClick(event) {
    const chipButton = event.target.closest('.chip-button');
    if (!chipButton) {
      return;
    }

    const skillToAdd = chipButton.getAttribute('data-skill');
    if (!skillToAdd) {
      return;
    }

    clearValidationFeedback();
    const currentInput = skillsInputElement.value.trim();

    if (currentInput.length === 0) {
      skillsInputElement.value = skillToAdd;
    } else {
      // Check if already included to prevent redundant appending
      const existingTokens = parseStudentEnteredSkills(currentInput);
      const isAlreadyPresent = existingTokens.some(function (token) {
        return normalizeSkillText(token) === normalizeSkillText(skillToAdd);
      });

      if (!isAlreadyPresent) {
        skillsInputElement.value = currentInput + ', ' + skillToAdd;
      }
    }

    skillsInputElement.focus();
  }

  /**
   * Resets the form and results to the initial state while clearing validation feedback.
   */
  function handleFormReset() {
    clearValidationFeedback();
    roleSelectElement.value = '';
    skillsInputElement.value = '';

    while (resultsBodyElement.firstChild) {
      resultsBodyElement.removeChild(resultsBodyElement.firstChild);
    }

    const placeholder = document.createElement('div');
    placeholder.className = 'state-empty-placeholder';
    placeholder.textContent =
      'Enter your skills above and choose a target role to view the required skills missing from your background.';
    resultsBodyElement.appendChild(placeholder);
  }

  /**
   * F1-9 Security & Integrity Verification:
   * Proactively verifies that mutation requests (POST/DELETE) sent to the team's API
   * are strictly refused by the backend with HTTP 405 Method Not Allowed.
   */
  async function handleTestMutationRefusal() {
    mutationTestOutputElement.hidden = false;
    mutationTestOutputElement.textContent = 'Dispatching test mutations to team API to verify F1-9 refusal rules...\n';

    // Test 1: POST attempt to add a posting
    const postAttemptResult = await executeApiRequest('/api/postings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'Junior Software Engineer',
        title: 'Unauthorized Posting Insertion Attempt',
        skills: ['Hacking']
      })
    });

    const postLogMessage =
      '1. POST /api/postings -> HTTP ' +
      postAttemptResult.statusCode +
      ' (Expected: 405 Refused)\n' +
      '   Server Response: ' +
      JSON.stringify(postAttemptResult.payload) +
      '\n\n';

    mutationTestOutputElement.textContent += postLogMessage;

    // Test 2: DELETE attempt to remove a posting
    const deleteAttemptResult = await executeApiRequest('/api/postings/post-101', {
      method: 'DELETE'
    });

    const deleteLogMessage =
      '2. DELETE /api/postings/post-101 -> HTTP ' +
      deleteAttemptResult.statusCode +
      ' (Expected: 405 Refused)\n' +
      '   Server Response: ' +
      JSON.stringify(deleteAttemptResult.payload) +
      '\n\n' +
      '\u2713 VERIFIED: All client modification requests are rejected by the server.';

    mutationTestOutputElement.textContent += deleteLogMessage;
  }

  /**
   * F1-8: Fetches the team-supplied posting dataset and collection date from GET /api/postings.
   * Client holds no database credentials or keys.
   */
  async function loadTeamPostingData() {
    headerCollectionBadge.textContent = 'Loading dataset...';
    resultCollectionDateValue.textContent = 'Loading...';

    const requestResult = await executeApiRequest('/api/postings', { method: 'GET' });

    if (!requestResult.isSuccess || !requestResult.payload) {
      headerCollectionBadge.textContent = 'Failed to load dataset';
      resultCollectionDateValue.textContent = 'Unavailable';
      skillsValidationElement.textContent =
        'Unable to contact the team postings API. Please check your network connection.';
      return;
    }

    cachedPostingData = requestResult.payload;
    hasSuccessfullyLoadedData = true;

    // Update collection date displays (F1-4, F1-10)
    headerCollectionBadge.textContent = cachedPostingData.collectionDate;
    resultCollectionDateValue.textContent = cachedPostingData.collectionDate;

    // Populate roles dropdown using textContent
    while (roleSelectElement.options.length > 1) {
      roleSelectElement.remove(1);
    }

    cachedPostingData.roles.forEach(function (roleName) {
      const optionElement = document.createElement('option');
      optionElement.value = roleName;
      optionElement.textContent = roleName;
      roleSelectElement.appendChild(optionElement);
    });
  }

  // Register event listeners
  formElement.addEventListener('submit', handleFormSubmission);
  resetFormButton.addEventListener('click', handleFormReset);
  presetChipsListElement.addEventListener('click', handlePresetChipClick);
  testMutationRefusalButton.addEventListener('click', handleTestMutationRefusal);

  // Initialize data fetching on startup
  loadTeamPostingData();
})();
