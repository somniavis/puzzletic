import React from 'react';
import './PrivacyPolicyPage.css';

type Locale = 'en' | 'ko';

type PrivacySection = {
    id: string;
    title: string;
    content: React.ReactNode;
};

const englishSections: PrivacySection[] = [
    {
        id: 'general',
        title: '1. General',
        content: (
            <>
                <p>
                    GroGroJello values your privacy and has prepared this Privacy Policy
                    to explain how we collect, use, and share your personal information.
                    This Privacy Policy applies to the GroGroJello website, mobile apps,
                    and related services (the "Service"). By using the Service, you agree
                    that GroGroJello may collect, use, and share your personal information
                    under the terms of this Privacy Policy.
                </p>
                <p>
                    Some features discussed in this Privacy Policy may not be available to
                    all users or in all jurisdictions.
                </p>
            </>
        ),
    },
    {
        id: 'information-we-collect',
        title: '2. Information We Collect',
        content: (
            <>
                <p>When you use the Service, GroGroJello may collect the following personal information.</p>
                <p>
                    <strong>Account registration.</strong> You may provide your email
                    address to register for a GroGroJello account. You may also register
                    using certain social login providers such as Google and Apple. If you
                    register through social login, GroGroJello may receive information
                    about you, including your email address, from the relevant provider.
                    If you registered through social login and later try to log in with a
                    password, we may direct you back to the social provider. You can
                    manage your GroGroJello account and social login settings through the
                    Service settings.
                </p>
                <p>
                    <strong>Profile information.</strong> After you register, a profile
                    page is created for you. Your profile may display information you have
                    submitted, such as your email address. By default, your profile is
                    public and may be visible to other GroGroJello users and anyone on
                    the internet. If your profile is public, third-party websites or web
                    scrapers may read, collect, and use your public information for their
                    own purposes.
                </p>
                <p>
                    <strong>Activity data and IP address.</strong> When you use the
                    Service, we may generate data about your use of the Service,
                    including browser and device data, log data, and your IP address. We
                    also generate data related to your participation in educational
                    activities within the Service. Unless a longer retention period is
                    required due to exceptional circumstances, we do not keep your IP
                    address for more than 30 days.
                </p>
                <p>
                    <strong>Cookies.</strong> When you visit the GroGroJello website, we
                    use cookies to store certain data in your browser. Cookies are pieces
                    of data stored on a user&apos;s device and may be linked to data about
                    that user. We use session ID cookies to confirm that a user is logged
                    in. Most browsers provide a simple way to reject or accept cookies,
                    though certain site features may depend on them. Cookies used by
                    GroGroJello may include targeting cookies from Google, Meta, Amazon,
                    and other companies, which may track your activity across websites to
                    deliver personalized advertising.
                </p>
                <p>
                    <strong>Google Analytics.</strong> We use Google Analytics, a web
                    analytics tool, to help us understand how users engage with our
                    website. Google Analytics uses first-party cookies to track user
                    interactions and collect information about how users use the site.
                    This information is used to prepare reports and improve the site. You
                    can opt out of Google Analytics by installing Google&apos;s browser
                    add-on.
                </p>
            </>
        ),
    },
    {
        id: 'how-we-process',
        title: '3. How We Process Your Information',
        content: (
            <>
                <p>
                    GroGroJello may process your personal information based on the
                    following legal grounds: to provide a product or service you
                    requested, to further GroGroJello&apos;s legitimate interests, to comply
                    with legal obligations, and with your consent.
                </p>
                <p>
                    <strong>Providing and improving the Service.</strong> We process your
                    personal information to provide and improve the Service. For example,
                    we use information you provide to maintain your profile and learning
                    progress, personalize learning content, detect and fix bugs, conduct
                    research, and provide customer support. We may share personal
                    information with third parties that help us provide or improve the
                    Service, such as hosting providers like Amazon Web Services, search
                    providers like Google, analytics providers like Mixpanel, payment
                    processors like Xsolla, and vendors supporting AI, speech
                    recognition, and content moderation features.
                </p>
                <p>
                    If you obtain a GroGroJello subscription through a promotion code, we
                    may share data about your GroGroJello use with the organization that
                    provided the promotion code.
                </p>
                <p>
                    <strong>Communicating with you.</strong> We may use the email address
                    you provide to send learning tips, practice reminders, progress
                    reports, notices about service or product changes, announcements about
                    new GroGroJello products, services, offers, or research opportunities,
                    and operational messages such as password reset emails. You may opt
                    out of non-essential messages in the app settings.
                </p>
                <p>
                    <strong>Legal compliance and prevention of harmful activity.</strong>
                    We may process and share personal information when necessary to comply
                    with legal requests such as subpoenas or court orders, to protect our
                    interests or property, to prevent fraud or other unlawful activity, to
                    assist law enforcement, or to prevent urgent harm.
                </p>
                <p>
                    <strong>Personalized advertising.</strong> We may process and share
                    your personal information to provide personalized ads. To do so, we
                    work with third-party ad networks, marketing analytics providers, and
                    website analytics companies such as Google, Meta, Oath, and Unity.
                    You may opt out of personalized ads in the app settings, and your
                    mobile device may also provide settings controlling ad identifiers.
                    Users in some jurisdictions, including the European Union and the
                    United Kingdom, may have personalized advertising disabled by default
                    unless they opt in.
                </p>
                <p>
                    <strong>De-identified information.</strong> We may de-identify your
                    personal information and use that de-identified data for any purpose,
                    including understanding learning trends and training artificial
                    intelligence models. De-identified information is not considered
                    personal information because it cannot identify an individual.
                </p>
            </>
        ),
    },
    {
        id: 'data-subject-rights',
        title: '4. Your Rights',
        content: (
            <>
                <p>
                    In addition to other rights required by applicable law, you may have
                    the following rights regarding the personal information we hold about
                    you:
                </p>
                <ul>
                    <li>the right to know what personal information we collected about you;</li>
                    <li>the right to access a copy of the personal information we hold;</li>
                    <li>the right to know what personal information we shared with third parties;</li>
                    <li>the right to object to certain sharing or processing activities;</li>
                    <li>the right to request deletion of personal information collected from you;</li>
                    <li>the right to request correction of inaccurate personal information;</li>
                    <li>the right to export personal information you provided in an electronic format;</li>
                    <li>the right to withdraw consent previously given; and</li>
                    <li>the right to delete your GroGroJello account through the Service.</li>
                </ul>
                <p>
                    You may update or correct certain information and exercise some
                    opt-out rights through the settings page. You may request access to
                    or deletion of personal information, or request account deletion, by
                    contacting <a href="mailto:grogrojello@gmail.com">grogrojello@gmail.com</a>.
                </p>
                <p>
                    These rights are not absolute. GroGroJello may refuse a request where
                    there is a legitimate reason, including where we cannot verify your
                    identity, where fulfilling the request may infringe third-party rights
                    or applicable law, or where it would interfere with the Service or
                    with providing the services you requested.
                </p>
            </>
        ),
    },
    {
        id: 'data-retention',
        title: '5. Data Retention',
        content: (
            <p>
                To keep your account functioning properly, GroGroJello generally retains
                your personal information until your account is deleted. However, we may
                retain certain information longer when necessary to provide the Service,
                defend GroGroJello&apos;s or a third party&apos;s legitimate interests, comply
                with legal requirements, resolve or defend disputes, investigate misuse or
                disruption of the Service, or perform a contract. We may retain
                de-identified data indefinitely.
            </p>
        ),
    },
    {
        id: 'children-under-13',
        title: '6. Information About Children Under 13',
        content: (
            <>
                <p>
                    When processing personal information about children under 13, the
                    company receives information from a legal guardian or obtains the
                    legal guardian&apos;s consent and collects only the minimum amount of
                    information necessary to perform the Service.
                </p>
                <p>
                    If personal information is collected directly from a child under 13,
                    the company may ask only for limited information about the legal
                    guardian, such as the guardian&apos;s name, contact details, and email,
                    and may verify consent through one of several lawful methods,
                    including website confirmation, card verification, mobile identity
                    verification, signed paper forms, email confirmation, telephone
                    confirmation, or equivalent measures.
                </p>
                <p>
                    <strong>COPPA.</strong> In connection with the Children&apos;s Online
                    Privacy Protection Act ("COPPA"), GroGroJello collects personal
                    information from children under 13 only for the sole purpose of
                    supporting the internal operations of the Service. If we learn that we
                    unintentionally collected additional personal information from such a
                    child, we will delete it. If you believe this has happened, please
                    contact <a href="mailto:grogrojello@gmail.com">grogrojello@gmail.com</a>.
                </p>
            </>
        ),
    },
    {
        id: 'do-not-track',
        title: '7. Do Not Track',
        content: (
            <p>
                The Service is not designed to respond to "do not track" signals sent by
                some browsers.
            </p>
        ),
    },
    {
        id: 'third-party-links',
        title: '8. Links to Third-Party Websites',
        content: (
            <p>
                The Service may contain links to other websites. GroGroJello is not
                responsible for the content or privacy practices of those websites,
                including information collected by third-party payment processors. We
                encourage users to review the privacy policies of other websites they
                visit. This Privacy Policy applies only to information collected by
                GroGroJello.
            </p>
        ),
    },
    {
        id: 'updates',
        title: '9. Updates to This Privacy Policy',
        content: (
            <p>
                We may update this Privacy Policy to reflect changes in our information
                processing practices. If we do so and the changes are material, we will
                notify you by email and indicate the latest revision date at the bottom of
                this Privacy Policy.
            </p>
        ),
    },
    {
        id: 'cookies-controls',
        title: '10. Installation, Operation, and Refusal of Automatic Collection Devices',
        content: (
            <>
                <p>
                    The company uses cookies to store and retrieve usage information in
                    order to provide individualized services and convenience. Cookies are
                    small pieces of information sent by the server operating the website
                    to the user&apos;s browser and stored on the user&apos;s computer or mobile
                    device.
                </p>
                <p>Users may refuse cookie storage by changing settings, including through:</p>
                <ul>
                    <li>Chrome: open a new Incognito window with Ctrl+Shift+N.</li>
                    <li>Edge: open a new InPrivate window with Ctrl+Shift+N.</li>
                    <li>Safari on mobile: device settings {'>'} Safari {'>'} Advanced {'>'} Block All Cookies.</li>
                    <li>Samsung Internet: tabs {'>'} Secret mode {'>'} Start.</li>
                </ul>
                <p>
                    Refusing cookie storage may make some services, such as staying logged
                    in, more difficult to use.
                </p>
            </>
        ),
    },
    {
        id: 'behavioral-information',
        title: '11. Behavioral Information',
        content: (
            <>
                <p>
                    The company collects and uses behavioral information in the course of
                    providing the Service in order to improve usability.
                </p>
                <p>
                    Collected items may include website and app visit, execution, and use
                    history, search history, and purchase history. Collection may occur
                    automatically when users visit or use the website or app through
                    Google Analytics provided by Google LLC. The purpose is to improve the
                    user experience, and the handling period follows Google&apos;s privacy
                    policy and Google Analytics terms.
                </p>
                <p>
                    The company collects only the minimum behavioral information necessary
                    for usability improvement and does not collect sensitive behavioral
                    information that may seriously infringe an individual&apos;s rights,
                    interests, or private life.
                </p>
            </>
        ),
    },
    {
        id: 'dormant-accounts',
        title: '12. Dormant Account Policy',
        content: (
            <p>
                The company separately stores the personal information of users who have
                not used the Service for 2 years and treats those accounts as dormant.
                Users can reactivate dormant status at any time by logging in. The company
                may also review information as needed to prevent duplicate account
                creation, enable reactivation, and comply with legal notice obligations.
            </p>
        ),
    },
    {
        id: 'exercise-of-rights',
        title: '13. Rights and Duties of Users and Legal Representatives',
        content: (
            <>
                <p>
                    Users may exercise privacy-related rights against the company at any
                    time, including requesting access, correction, deletion, suspension of
                    processing, or withdrawal of consent, by contacting the company
                    through the website, in writing, by phone, or by email. The company
                    will respond without undue delay.
                </p>
                <p>
                    These rights may also be exercised through a legal representative or
                    duly authorized agent, in which case proof of authorization must be
                    provided.
                </p>
                <p>Requests may be limited where, for example:</p>
                <ul>
                    <li>special laws require the processing or retention;</li>
                    <li>granting the request may harm another person&apos;s life, body, property, or interests;</li>
                    <li>a public institution would be unable to perform a legally assigned duty; or</li>
                    <li>
                        the Service could not be provided under the applicable contract and
                        the data subject has not clearly expressed an intent to terminate
                        that contract.
                    </li>
                </ul>
            </>
        ),
    },
    {
        id: 'security-measures',
        title: '14. Security Measures',
        content: (
            <>
                <p>
                    The company takes technical, administrative, and physical measures to
                    ensure the security of personal information.
                </p>
                <ul>
                    <li>Administrative measures: internal management plans and regular employee training.</li>
                    <li>Technical measures: access control, permission management, encryption, and security programs.</li>
                    <li>Physical measures: secure storage of documents and storage media containing personal information.</li>
                </ul>
            </>
        ),
    },
    {
        id: 'privacy-officer',
        title: '15. Privacy Officer',
        content: (
            <>
                <p>
                    The company has designated the following person in charge of personal
                    information protection and related complaints or remedies.
                </p>
                <ul>
                    <li>Officer: Kim Jintae</li>
                    <li>Email: <a href="mailto:grogrojello@gmail.com">grogrojello@gmail.com</a></li>
                </ul>
                <p>
                    For reports or consultations relating to privacy infringement, users
                    in Korea may also contact the Personal Information Infringement Report
                    Center, the Personal Information Dispute Mediation Committee, the
                    Supreme Prosecutors&apos; Office Cyber Investigation Division, or the
                    National Police Agency Cyber Bureau.
                </p>
            </>
        ),
    },
    {
        id: 'additional-jurisdictions',
        title: '16. Additional Terms for Certain Jurisdictions',
        content: (
            <p>
                In some jurisdictions, additional privacy policies or local laws may
                apply to the Service. For users in those jurisdictions, the applicable
                additional privacy policy and local law will prevail over this Privacy
                Policy to the extent of any conflict.
            </p>
        ),
    },
    {
        id: 'changes',
        title: '17. Changes to This Privacy Policy',
        content: (
            <p>
                If additions, deletions, or modifications are made to this Privacy
                Policy, we will provide notice of the changes and their contents through
                notices or similar means at least 7 days before they take effect.
                However, if the changes materially affect users&apos; important rights or
                obligations, we will provide notice at least 30 days before the effective
                date.
            </p>
        ),
    },
];

const koreanSections: PrivacySection[] = [
    {
        id: 'general',
        title: '1. 일반 사항',
        content: (
            <>
                <p>
                    GroGroJello는 귀하의 개인정보를 소중히 여기며, 당사가 개인정보를
                    수집, 이용 및 공유하는 방법을 설명하기 위해 본 개인정보처리방침을
                    마련하였습니다. 본 개인정보처리방침은 GroGroJello 웹사이트, 모바일 앱
                    및 관련 서비스(이하 "서비스")에 적용됩니다. 서비스를 이용함으로써
                    귀하는 본 개인정보처리방침의 조건에 따라 GroGroJello가 귀하의
                    개인정보를 수집, 이용 및 공유하는 것에 동의하게 됩니다.
                </p>
                <p>
                    본 개인정보처리방침에서 논의되는 기능 중 일부는 모든 사용자에게 또는
                    모든 관할권에서 제공되지 않을 수 있습니다.
                </p>
            </>
        ),
    },
    {
        id: 'information-we-collect',
        title: '2. 수집하는 정보',
        content: (
            <>
                <p>서비스를 이용하는 경우, GroGroJello는 아래와 같은 귀하의 개인정보를 수집할 수 있습니다.</p>
                <p>
                    <strong>계정 등록.</strong> GroGroJello 계정 등록을 위해 귀하는 이메일
                    주소를 제공할 수 있습니다. 귀하는 Google 및 Apple 등 특정 소셜
                    로그인을 사용하여 GroGroJello 계정을 등록할 수도 있습니다. 소셜
                    로그인을 통해 등록하는 경우, GroGroJello는 소셜 로그인 제공자로부터
                    귀하에 관한 정보(이메일 주소)를 제공받을 수 있습니다.
                </p>
                <p>
                    <strong>프로필 정보.</strong> GroGroJello 계정 등록 후 귀하를 위한
                    프로필 페이지가 생성됩니다. 프로필에는 귀하가 제출한 정보(예: 이메일)가
                    표시됩니다. 기본적으로 귀하의 프로필은 공개이며, 다른 GroGroJello
                    사용자 및 인터넷상의 누구에게나 표시될 수 있습니다.
                </p>
                <p>
                    <strong>활동 데이터 및 IP 주소.</strong> 서비스를 이용할 때, 당사는
                    귀하의 서비스 이용에 관한 데이터를 생성할 수 있으며, 여기에는 귀하의
                    브라우저 및 기기 데이터, 로그 데이터 및 IP 주소가 포함될 수 있습니다.
                    또한 서비스 내 교육 활동에 대한 귀하의 참여와 관련된 데이터도
                    생성합니다. 당사는 예외적인 사정으로 더 장기간 보관이 필요한 경우를
                    제외하고, 귀하의 IP 주소를 30일을 초과하여 보관하지 않습니다.
                </p>
                <p>
                    <strong>쿠키.</strong> GroGroJello 웹사이트에 접속하면, 당사는 쿠키를
                    사용하여 귀하의 브라우저에서 특정 데이터를 저장합니다. 쿠키는 사용자에
                    관한 데이터에 연결되어 사용자의 컴퓨터에 저장되는 데이터 조각입니다.
                    당사는 사용자가 로그인되어 있는지 확인하기 위해 세션 ID 쿠키를
                    사용합니다. GroGroJello의 쿠키에는 Google, Meta, Amazon 및 기타
                    회사의 타기팅 쿠키가 포함될 수 있습니다.
                </p>
                <p>
                    <strong>Google Analytics.</strong> 당사는 웹사이트에서 사용자가
                    어떻게 참여하는지 이해하는 데 도움이 되는 웹 분석 도구인 Google
                    Analytics를 사용합니다. 이 정보는 보고서를 작성하고 사이트를 개선하는
                    데 사용됩니다. 귀하는 Google의 브라우저 애드온을 설치하여 Google
                    Analytics를 거부할 수 있습니다.
                </p>
            </>
        ),
    },
    {
        id: 'how-we-process',
        title: '3. 귀하의 정보를 처리하는 방법',
        content: (
            <>
                <p>
                    GroGroJello는 다음과 같은 법적 근거에 따라 귀하의 개인정보를 처리할 수
                    있습니다. 귀하가 요청한 제품 또는 서비스를 제공하기 위해,
                    GroGroJello의 정당한 이익을 증진하기 위해, 법적 의무를 준수하기 위해,
                    그리고 귀하의 동의에 따라 처리할 수 있습니다.
                </p>
                <p>
                    <strong>서비스 제공 및 개선.</strong> GroGroJello는 서비스를 제공하고
                    개선하기 위해 귀하의 개인정보를 처리합니다. 예를 들어, 귀하의 프로필
                    및 학습 진행을 유지하고, 학습 콘텐츠를 개인화하고, 버그를 탐지 및
                    수정하며, 연구를 수행하고, 고객 지원을 제공합니다. 또한 Amazon Web
                    Services, Google, Mixpanel, Xsolla 등과 같은 제3자와 개인정보를
                    공유할 수 있습니다.
                </p>
                <p>
                    귀하가 프로모션 코드를 사용하여 GroGroJello 구독을 획득하는 경우,
                    당사는 귀하의 GroGroJello 사용에 관한 데이터를 해당 프로모션 코드를
                    제공한 조직과 공유할 수 있습니다.
                </p>
                <p>
                    <strong>귀하와의 커뮤니케이션.</strong> GroGroJello는 귀하가 제공한
                    이메일 주소를 사용하여 학습 팁, 연습 알림, 진행 보고서, 서비스 또는
                    제품 변경에 관한 공지, 신규 제품 또는 연구 기회에 관한 공지, 비밀번호
                    재설정 이메일 등 운영상 필요한 메시지를 발송할 수 있습니다. 필수적이지
                    않은 메시지는 앱 설정에서 수신 거부할 수 있습니다.
                </p>
                <p>
                    <strong>법 준수 및 유해 활동 방지.</strong> GroGroJello는 소환장 또는
                    법원 명령 등 법적 요청을 준수하기 위해 필요한 경우 개인정보를 처리 및
                    공유할 수 있습니다. 또한 법 준수, 당사의 이익 또는 재산 보호, 사기
                    또는 기타 불법 활동 방지, 법 집행 지원 또는 긴급한 위해 방지를 위해
                    필요하다고 판단되는 경우 개인정보를 공유할 수 있습니다.
                </p>
                <p>
                    <strong>맞춤형 광고.</strong> GroGroJello는 귀하에게 맞춤형 광고를
                    제공하기 위한 목적으로 귀하의 개인정보를 처리 및 공유할 수 있습니다.
                    이를 위해 Google, Meta, Oath 및 Unity 등 다양한 제3자 광고 네트워크,
                    마케팅 분석 서비스 제공자 및 웹사이트 분석 업체와 협력합니다. 귀하는
                    앱 설정에서 맞춤형 광고 수신을 거부할 수 있습니다.
                </p>
                <p>
                    <strong>익명화된 정보.</strong> GroGroJello는 귀하의 개인정보를
                    익명화할 수 있으며, 학습 경향을 더 잘 이해하거나 인공지능 모델을
                    학습시키는 등 어떠한 목적으로든 이 비식별화된 데이터를 사용할 수
                    있습니다.
                </p>
            </>
        ),
    },
    {
        id: 'data-subject-rights',
        title: '4. 정보주체의 권리',
        content: (
            <>
                <p>
                    귀하는 적용 법령이 요구하는 기타 권리 외에도, 당사가 보유한 귀하의
                    개인정보와 관련하여 다음과 같은 권리를 가질 수 있습니다.
                </p>
                <ul>
                    <li>당사가 귀하에 대해 어떤 개인정보를 수집했는지 알 권리</li>
                    <li>당사가 보유한 개인정보 사본에 접근할 권리</li>
                    <li>당사가 귀하의 어떤 개인정보를 제3자와 공유했는지 알 권리</li>
                    <li>제3자와의 개인정보 공유를 거부하거나 처리에 이의를 제기할 권리</li>
                    <li>당사가 귀하로부터 수집한 개인정보의 삭제를 요청할 권리</li>
                    <li>부정확한 개인정보의 정정을 요청할 권리</li>
                    <li>개인정보를 전자적으로 이전 가능한 형식으로 내보낼 권리</li>
                    <li>이전에 제공한 개인정보 처리 동의를 철회할 권리</li>
                    <li>서비스 내 안내에 따라 GroGroJello 계정을 삭제할 권리</li>
                </ul>
                <p>
                    귀하는 설정 페이지에서 정보를 업데이트 또는 정정하고, 일부 거부
                    권리를 행사할 수 있습니다. 개인정보 관련 요청은{' '}
                    <a href="mailto:grogrojello@gmail.com">grogrojello@gmail.com</a>으로
                    보낼 수 있습니다.
                </p>
                <p>
                    이러한 권리는 절대적인 권리가 아니며, GroGroJello는 정당한 사유가
                    있는 경우 요청을 거부할 수 있습니다.
                </p>
            </>
        ),
    },
    {
        id: 'data-retention',
        title: '5. 데이터 보관',
        content: (
            <p>
                계정이 정상적으로 유지되도록 하기 위해, GroGroJello는 일반적으로 귀하의
                계정이 삭제될 때까지 귀하의 개인정보를 보관합니다. 다만 서비스를
                제공하거나, 정당한 이익을 방어하기 위해, 법적 요구사항을 준수하기 위해,
                분쟁을 해결하거나 방어하기 위해, 서비스 오남용 또는 중단을 조사하기 위해,
                또는 계약을 이행하기 위해 필요한 경우 특정 정보를 더 오래 보관할 수
                있습니다. 또한 익명화된 데이터는 무기한 보관할 수 있습니다.
            </p>
        ),
    },
    {
        id: 'children-under-13',
        title: '6. 만 13세 미만 아동의 개인정보 처리에 관한 사항',
        content: (
            <>
                <p>
                    회사는 만 13세 미만 아동에 대해 개인정보를 처리할 때 법정대리인으로부터
                    개인정보를 제공받거나 법정대리인의 동의를 얻어 해당 서비스 수행에
                    필요한 최소한의 개인정보를 수집합니다.
                </p>
                <p>
                    회사는 만 13세 미만 아동의 개인정보를 해당 아동으로부터 수집할 때에는
                    아동에게 법정대리인의 성명, 연락처, 이메일과 같이 최소한의 정보를
                    요구할 수 있으며, 웹사이트 확인, 카드정보 제공, 휴대전화 본인인증,
                    서면 제출, 전자우편, 전화 또는 이에 준하는 방법으로 적법한
                    법정대리인의 동의를 확인할 수 있습니다.
                </p>
                <p>
                    <strong>COPPA.</strong> 아동 온라인 개인정보 보호법과 관련하여,
                    GroGroJello는 서비스의 내부 운영을 수행하기 위한 유일한 목적으로
                    13세 미만 아동의 개인정보를 수집합니다. 그러한 아동으로부터 추가적인
                    개인정보를 의도치 않게 수집했음을 발견하는 경우, 당사는 해당 정보를
                    삭제합니다.
                </p>
            </>
        ),
    },
    {
        id: 'do-not-track',
        title: '7. 추적 금지(Do Not Track)',
        content: (
            <p>
                서비스는 일부 브라우저가 전송하는 "추적 금지(do not track)" 신호에
                응답하도록 설계되어 있지 않습니다.
            </p>
        ),
    },
    {
        id: 'third-party-links',
        title: '8. 제3자 웹사이트로의 링크',
        content: (
            <p>
                서비스에는 다른 웹사이트로의 링크가 포함될 수 있습니다. GroGroJello는
                제3자 결제 처리자가 수집하는 개인정보 또는 금융 정보를 포함하여, 다른
                웹사이트의 콘텐츠 또는 개인정보 처리 관행에 대해 책임을 지지 않습니다.
                본 개인정보처리방침은 GroGroJello가 수집하는 정보에만 적용됩니다.
            </p>
        ),
    },
    {
        id: 'updates',
        title: '9. 개인정보처리방침의 업데이트',
        content: (
            <p>
                당사는 정보 처리 관행의 변경을 반영하기 위해 개인정보처리방침을
                업데이트할 수 있습니다. 변경 사항이 중요한 경우, 당사는 이메일로
                귀하에게 통지하며, 개인정보처리방침 하단에 최종 개정일을 표시합니다.
            </p>
        ),
    },
    {
        id: 'cookies-controls',
        title: '10. 개인정보 자동수집장치의 설치운영 및 거부에 관한 사항',
        content: (
            <>
                <p>
                    회사는 개별적인 서비스와 편의를 제공하기 위해 이용정보를 저장하고
                    수시로 불러오는 쿠키(cookie)를 사용합니다. 쿠키는 웹사이트를
                    운영하는데 이용되는 서버가 이용자의 브라우저에 보내는 소량의
                    정보이며, 이용자의 컴퓨터 또는 모바일에 저장됩니다.
                </p>
                <p>이용자는 아래와 같이 설정을 변경함으로써 쿠키의 저장을 거부할 수 있습니다.</p>
                <ul>
                    <li>웹 브라우저: Chrome 시크릿 창, Edge InPrivate 창</li>
                    <li>모바일 브라우저: Safari 쿠키 차단, 삼성 인터넷 비밀 모드 등</li>
                </ul>
                <p>
                    쿠키 저장을 거부할 경우 일부 서비스 이용(로그인 유지 등)에 어려움이
                    발생할 수 있습니다.
                </p>
            </>
        ),
    },
    {
        id: 'behavioral-information',
        title: '11. 행태정보의 수집·이용 및 거부 등에 관한 사항',
        content: (
            <>
                <p>
                    회사는 서비스 이용과정에서 이용자의 사용성 개선을 제공하기 위해서
                    행태정보를 수집·이용하고 있습니다.
                </p>
                <p>
                    수집 항목에는 이용자의 웹사이트 및 앱 방문/실행/이용내역, 검색이력,
                    구매이력이 포함될 수 있으며, Google LLC가 제공하는 Google Analytics를
                    이용하여 자동 수집될 수 있습니다. 수집 목적은 이용자의 사용성 개선
                    제공입니다.
                </p>
                <p>
                    회사는 필요한 최소한의 행태정보만을 수집하며, 민감한 행태정보는
                    수집하지 않습니다.
                </p>
            </>
        ),
    },
    {
        id: 'dormant-accounts',
        title: '12. 휴면 계정 정책',
        content: (
            <p>
                회사는 2년간 서비스를 이용하지 않은 이용자의 개인정보를 별도로 분리
                보관하며, 휴면 계정으로 전환된 이용자는 로그인을 통해 언제든지 휴면을
                해제할 수 있습니다. 또한 중복 계정 생성 방지, 휴면 해제 제공, 법령상
                통지의무 이행을 위해 필요한 조회를 할 수 있습니다.
            </p>
        ),
    },
    {
        id: 'exercise-of-rights',
        title: '13. 이용자 및 법정 대리인의 권리의무 및 그 행사방법',
        content: (
            <>
                <p>
                    이용자는 회사에 대해 언제든지 개인정보 열람요구, 정정 요구, 삭제요구,
                    처리정지 요구, 동의 철회 등 개인정보 보호 관련 권리를 행사할 수
                    있으며, 회사는 이에 대해 지체없이 조치하겠습니다.
                </p>
                <p>
                    이러한 권리 행사는 이용자의 법정대리인이나 위임을 받은 자 등 대리인을
                    통하여 하실 수 있으며, 이 경우 위임사실을 확인할 수 있는 위임장을
                    제출하셔야 합니다.
                </p>
                <p>다만 다음과 같은 경우 요청이 제한될 수 있습니다.</p>
                <ul>
                    <li>법률에 특별한 규정이 있거나 법령상 의무를 준수하기 위하여 불가피한 경우</li>
                    <li>다른 사람의 생명, 신체, 재산 또는 이익을 부당하게 침해할 우려가 있는 경우</li>
                    <li>공공기관이 법률상 소관 업무를 수행할 수 없는 경우</li>
                    <li>개인정보를 처리하지 아니하면 계약 이행이 곤란한 경우</li>
                </ul>
            </>
        ),
    },
    {
        id: 'security-measures',
        title: '14. 개인정보의 안전성 확보 조치',
        content: (
            <>
                <p>
                    회사는 개인정보의 안전성 확보를 위해 다음과 같은 기술적, 관리적,
                    물리적 보호조치를 취하고 있습니다.
                </p>
                <ul>
                    <li>관리적 조치: 내부관리계획 수립, 시행, 정기적 직원 교육 등</li>
                    <li>기술적 조치: 접근권한 관리, 접근통제시스템 설치, 암호화, 보안프로그램 설치 등</li>
                    <li>물리적 조치: 문서 및 저장매체의 안전한 보관 등</li>
                </ul>
            </>
        ),
    },
    {
        id: 'privacy-officer',
        title: '15. 개인정보 보호책임자',
        content: (
            <>
                <p>
                    회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와
                    관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이
                    개인정보 보호책임자 및 담당자를 지정하고 있습니다.
                </p>
                <ul>
                    <li>책임자: 김진태</li>
                    <li>이메일: <a href="mailto:grogrojello@gmail.com">grogrojello@gmail.com</a></li>
                </ul>
                <p>
                    기타 개인정보침해에 대한 신고나 상담이 필요하신 경우에는 개인정보
                    침해신고센터, 개인정보분쟁조정위원회, 대검찰청 사이버수사과, 경찰청
                    사이버안전국 등에 문의하실 수 있습니다.
                </p>
            </>
        ),
    },
    {
        id: 'additional-jurisdictions',
        title: '16. 특정 관할권의 추가 조항',
        content: (
            <p>
                일부 관할권에서는 서비스에 추가적인 개인정보처리방침 또는 현지 법률이
                적용될 수 있습니다. 해당 관할권의 사용자에게는, 적용 가능한 추가
                개인정보처리방침 및 현지 법률이 본 개인정보처리방침과 상충하는 범위에서
                본 개인정보처리방침에 우선합니다.
            </p>
        ),
    },
    {
        id: 'changes',
        title: '17. 개인정보처리방침의 변경',
        content: (
            <p>
                본 개인정보 처리방침에 대한 추가, 삭제 및 수정이 있을 경우에는 시행하는
                날로부터 최소 7일전에 공지사항 등을 통해 변경 및 내용 등을 공지하도록
                하겠습니다. 다만 이용자의 소중한 권리 또는 의무에 중요한 내용 변경이
                발생하는 경우 시행일로부터 최소 30일 전에 공지하도록 하겠습니다.
            </p>
        ),
    },
];

export const PrivacyPolicyPage: React.FC = () => {
    const [locale, setLocale] = React.useState<Locale>('en');

    const sections = locale === 'ko' ? koreanSections : englishSections;
    const eyebrow = locale === 'ko' ? 'GroGroJello 법률' : 'GroGroJello Legal';
    const title = locale === 'ko' ? '개인정보처리방침' : 'Privacy Policy';
    const footerText =
        locale === 'ko'
            ? '이 코드베이스 기준 마지막 반영일: 2026년 4월 15일'
            : 'Last translated and published in this codebase on April 15, 2026.';

    return (
        <div className="privacy-page">
            <div className="privacy-page__hero">
                <div className="privacy-page__hero-inner">
                    <div className="privacy-page__toolbar">
                        <div>
                            <p className="privacy-page__eyebrow">{eyebrow}</p>
                            <h1>{title}</h1>
                        </div>

                        <label className="privacy-page__language-picker">
                            <span className="privacy-page__language-label">
                                {locale === 'ko' ? '언어' : 'Language'}
                            </span>
                            <select
                                aria-label={locale === 'ko' ? '언어 선택' : 'Select language'}
                                value={locale}
                                onChange={(event) => setLocale(event.target.value as Locale)}
                            >
                                <option value="en">English</option>
                                <option value="ko">한국어</option>
                            </select>
                        </label>
                    </div>
                </div>
            </div>

            <main className="privacy-page__content" role="main">
                <div className="privacy-page__content-inner">
                    <article className="privacy-document" aria-label={title}>
                        {sections.map((section) => (
                            <section key={section.id} className="privacy-section" id={section.id}>
                                <h2>{section.title}</h2>
                                <div className="privacy-section__body">{section.content}</div>
                            </section>
                        ))}
                    </article>

                    <footer className="privacy-page__footer">
                        <p>{footerText}</p>
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default PrivacyPolicyPage;
