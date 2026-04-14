import React from 'react';
import './TermsOfServicePage.css';

type Locale = 'en' | 'ko';

type TermsSection = {
    id: string;
    title: string;
    content: React.ReactNode;
};

const englishSections: TermsSection[] = [
    {
        id: 'general',
        title: '1. General',
        content: (
            <>
                <p>
                    The GroGroJello website ("Websites"), mobile applications ("Apps"),
                    and related services (collectively, the "Service") are operated by
                    GroGroJello ("GroGroJello," "we," "us," or "our"). Access to and
                    use of the Service are subject to these Terms and Conditions. By
                    accessing or using any part of the Service, you agree to be bound by
                    these Terms and Conditions, including any future revisions.
                </p>
                <p>
                    GroGroJello may revise, update, or change these Terms and
                    Conditions. If we do, we will post notice of the change on the
                    Websites for at least 7 days and indicate the latest revision date at
                    the bottom of these Terms. Any revision becomes effective on the
                    earlier of: (i) the expiration of that 7-day notice period, or (ii)
                    your first access to or use of the Service after the revision. If
                    you do not agree to comply with these Terms, you may not use the
                    Service.
                </p>
                <p>
                    Please note: these Terms include a dispute resolution provision that
                    may require individual arbitration rather than a jury trial or class
                    action in certain situations.
                </p>
            </>
        ),
    },
    {
        id: 'description',
        title: '2. Description of the Website and Service',
        content: (
            <p>
                The Service allows users to access educational services, including math
                learning and practice. GroGroJello may update, modify, suspend,
                improve, or discontinue all or any part of the Service at any time, in
                its sole discretion, either temporarily or permanently.
            </p>
        ),
    },
    {
        id: 'permitted-use',
        title: '3. Permitted Use of the Service',
        content: (
            <>
                <p>
                    You are responsible for your use of the Service and for all use
                    conducted through your account. Our goal is to provide a positive,
                    helpful, and safe user experience. To support that goal, certain
                    conduct that may harm other users or us is prohibited.
                </p>
                <p>
                    When using the Service, you must comply with our community
                    guidelines.
                </p>
            </>
        ),
    },
    {
        id: 'additional-terms',
        title: '4. Additional Terms',
        content: (
            <p>
                Some parts of the Service may be subject to additional terms
                ("Additional Terms"). If Additional Terms apply to a specific Service,
                they will be made available to you when you use that Service. By using
                that Service, you agree to the applicable Additional Terms.
            </p>
        ),
    },
    {
        id: 'registration',
        title: '5. Registration',
        content: (
            <p>
                When registering for and using the Service, you agree to: (i) provide
                accurate, current, and complete information about yourself and/or your
                organization as requested by GroGroJello; (ii) maintain the
                confidentiality of your password and other account security information;
                (iii) promptly update your registration information to keep it accurate,
                current, and complete; and (iv) accept full responsibility for all use
                of your account and all activities that occur under it.
            </p>
        ),
    },
    {
        id: 'representations',
        title: '6. Your Representations and Warranties',
        content: (
            <>
                <p>
                    You represent and warrant to GroGroJello that your access to and use
                    of the Service complies with these Terms and all applicable laws,
                    rules, and regulations in the United States and other relevant
                    jurisdictions, including laws relating to online conduct, acceptable
                    content, and the transmission of exported data or information.
                </p>
                <p>
                    You further represent and warrant that any materials you submit
                    through the Service, including activity materials and content, are
                    created or owned by you, and that you have the right to grant us the
                    licenses described in these Terms or assign those rights to us where
                    applicable.
                </p>
                <p>
                    You also represent and warrant that you are not: (1) organized
                    under, operating in, or ordinarily resident in any country or region
                    subject to comprehensive U.S. trade or economic sanctions; (2)
                    listed on any prohibited or restricted party list, such as the U.S.
                    Treasury Department&apos;s List of Specially Designated Nationals and
                    Blocked Persons; or (3) otherwise subject to U.S. sanctions.
                </p>
            </>
        ),
    },
    {
        id: 'content-submissions',
        title: '7. Content Submissions',
        content: (
            <>
                <p>
                    As a condition of submitting ratings, reviews, information, data,
                    text, photographs, audio clips, audiovisual works, translations,
                    flashcards, or other materials (collectively, "Content") to the
                    Service, you grant GroGroJello a fully paid, royalty-free,
                    perpetual, irrevocable, worldwide, non-exclusive, transferable, and
                    sublicensable license to use, reproduce, adapt, modify, combine,
                    distribute, publicly display, and create derivative works from that
                    Content, including combining it with other works and sublicensing it
                    through multiple tiers.
                </p>
                <p>
                    You acknowledge that this license cannot be terminated by you after
                    the Content is submitted to the Service. You represent that you have
                    the legal rights necessary for you, GroGroJello, and others as
                    described in these Terms to use the Content. You understand that
                    other users may access the Content and that neither they nor
                    GroGroJello are obligated to keep it confidential.
                </p>
                <p>You may not upload, display, or otherwise make available Content that:</p>
                <ul>
                    <li>
                        violates the law, infringes the rights of a third party, or is
                        defamatory, abusive, threatening, harassing, hateful, or
                        otherwise objectionable;
                    </li>
                    <li>
                        in GroGroJello&apos;s sole judgment, is inappropriate or could
                        restrict or inhibit another person&apos;s use of the Service or
                        expose GroGroJello or users to harm or liability; or
                    </li>
                    <li>violates GroGroJello&apos;s community guidelines.</li>
                </ul>
            </>
        ),
    },
    {
        id: 'indemnity',
        title: '8. Indemnification of GroGroJello',
        content: (
            <p>
                You agree to defend, indemnify, and hold harmless GroGroJello and its
                directors, officers, employees, contractors, agents, suppliers,
                licensors, successors, and assigns from and against any losses, claims,
                causes of action, obligations, liabilities, damages, and expenses,
                including attorneys&apos; fees, arising out of or relating to your access
                to or use of the Service, any misrepresentation made by you, any breach
                of these Terms, or any allegation that any translation provided by us is
                inaccurate, inappropriate, or otherwise defective.
            </p>
        ),
    },
    {
        id: 'app-license',
        title: '9. License for Apps',
        content: (
            <>
                <p>
                    Subject to these Terms, GroGroJello grants you a non-exclusive,
                    non-transferable license to download, install, and use one copy of
                    each App, in object code form only, on an interactive wireless
                    device that you own or control.
                </p>
                <p>
                    You may not derive or attempt to derive source code from any part of
                    an App, permit a third party to do so, or reverse engineer,
                    decompile, disassemble, or translate any App. GroGroJello and its
                    licensors retain all intellectual property rights and other rights in
                    the Apps and any updates, modifications, or revisions.
                </p>
                <p>
                    If you obtain an App through Google Play or the Apple App Store, any
                    platform-specific terms required by those storefronts also apply. You
                    acknowledge that these Terms are between you and GroGroJello, not
                    between you and Google or Apple, and that Google and Apple are not
                    responsible for the Apps or their content except as required by
                    applicable storefront terms.
                </p>
            </>
        ),
    },
    {
        id: 'in-app-purchases',
        title: '10. In-App Purchases',
        content: (
            <>
                <p>
                    You may purchase the following products through the Service:
                </p>
                <ul>
                    <li>
                        Recurring subscriptions for 3-month or 12-month terms. These
                        subscriptions renew automatically for the same term unless you
                        cancel them through your GroGroJello account in accordance with
                        the instructions provided.
                    </li>
                    <li>
                        Fixed-term access passes for 3-month or 12-month terms. These
                        products do not automatically renew or rebill after the stated
                        term ends.
                    </li>
                </ul>
                <p>
                    Under our Buy 1, Give 1 social contribution program, if you purchase
                    a 12-month subscription, GroGroJello will donate one 12-month access
                    account to a low-income student as part of our education access
                    initiative and will issue you a digital donation certificate.
                </p>
                <ul>
                    <li>
                        The company may fulfill that donation either by delivering an
                        account directly to a student in need or by distributing it
                        through a trusted NGO, nonprofit, or educational institution.
                    </li>
                    <li>
                        The company manages the donation process, including beneficiary
                        selection, account assignment, and delivery confirmation.
                    </li>
                    <li>
                        The donation program does not grant the purchaser any additional
                        service rights or ownership beyond the purchaser&apos;s own account,
                        and donated accounts cannot be refunded for cash, sold, or
                        transferred.
                    </li>
                </ul>
                <p>
                    You agree to pay all fees and applicable taxes incurred by you or by
                    anyone using a GroGroJello account registered in your name.
                    GroGroJello may change the prices of products or services offered
                    through the Service at any time. All billing information you submit
                    for a purchase or transaction must be accurate, complete, and
                    current.
                </p>
            </>
        ),
    },
    {
        id: 'payment-processors',
        title: '11. Payment Processors',
        content: (
            <p>
                All monetary transactions made in connection with the Service are
                processed by third parties and are subject to those third parties&apos;
                terms of use, privacy policies, and applicable payment terms. You are
                responsible for reviewing those third-party practices. GroGroJello is
                not responsible for the acts or omissions of third-party payment
                processors, including system downtime or interruptions in payment
                services.
            </p>
        ),
    },
    {
        id: 'refund-policy',
        title: '12. Refund Policy',
        content: (
            <>
                <p>
                    As a general rule, all payments are non-refundable, and no refund or
                    credit is provided for virtual items or partially used access or
                    subscription periods. However, mandatory withdrawal or refund rights
                    under applicable law, including Korean consumer protection laws,
                    will prevail where required.
                </p>
                <p>
                    If you purchase a paid service and do not use any of the content at
                    all, such as by not attempting any math puzzle or not progressing
                    character evolution, you may request withdrawal within 7 days of the
                    payment date and receive a full refund.
                </p>
                <p>
                    The 12-month subscription is a special product linked to the social
                    donation program. Once service use begins or a digital donation
                    certificate has been issued, GroGroJello may treat the donation
                    fulfillment process as completed immediately.
                </p>
                <p>
                    If you request cancellation and a refund after beginning use of that
                    product, GroGroJello may deduct the following amounts to the extent
                    permitted by law:
                </p>
                <ul>
                    <li>
                        Actual expenses incurred in fulfilling the donation, including
                        the cost and related expenses of the 12-month account already
                        provided to a low-income student;
                    </li>
                    <li>
                        Fees corresponding to the period already used, calculated on a
                        daily pro rata basis; and
                    </li>
                    <li>10% of the total payment amount as an early termination fee.</li>
                </ul>
                <p>
                    Even if a refund is processed, access rights already granted to a
                    student beneficiary will not be withdrawn or canceled. Upon
                    completion of the refund, any digital donation certificate issued in
                    connection with that purchase becomes immediately invalid.
                </p>
                <p>Refunds may also be restricted if:</p>
                <ul>
                    <li>more than 7 days have passed since purchase;</li>
                    <li>you have already used part of the digital content;</li>
                    <li>you have consumed any virtual items, such as gems; or</li>
                    <li>another legal ground restricting withdrawal applies.</li>
                </ul>
                <p>
                    If you cancel a recurring paid subscription, you may continue using
                    the paid features until the end of the current billing period. If
                    you purchase a fixed-term access pass, access ends automatically when
                    the term expires and no separate cancellation process is required.
                </p>
                <p>
                    If you purchase a paid product through the Apple App Store or Google
                    Play Store, refunds are handled according to that storefront&apos;s
                    terms and payment system. GroGroJello does not have authority to
                    directly approve or issue refunds for purchases made through those
                    platforms.
                </p>
            </>
        ),
    },
    {
        id: 'third-party',
        title: '13. Third-Party Links, Sites, and Services',
        content: (
            <>
                <p>
                    The Service may contain links to third-party websites, advertisers,
                    services, special offers, or other events or activities that
                    GroGroJello does not own or control. We do not endorse and are not
                    responsible for those third-party sites, materials, products, or
                    services.
                </p>
                <p>
                    If you access a third-party website, service, or content through
                    GroGroJello, you understand that these Terms and our Privacy Policy
                    do not apply to that use. You expressly acknowledge and agree that
                    GroGroJello is not responsible, directly or indirectly, for any loss
                    or damage arising from your use of or reliance on any such
                    third-party website, service, or content.
                </p>
            </>
        ),
    },
    {
        id: 'disclaimer',
        title: '14. Disclaimer of Representations and Warranties',
        content: (
            <p>
                The Service, including all images, audio files, and other content, and
                all other information, property, and rights provided by GroGroJello are
                provided on an "AS IS" basis. GroGroJello and its suppliers expressly
                disclaim all representations and warranties of any kind, whether express
                or implied, including warranties of merchantability, fitness for a
                particular purpose, and non-infringement. GroGroJello does not guarantee
                accuracy, availability, completeness, uninterrupted operation, results
                obtained from use, or non-infringement. The Service may become
                unavailable because of heavy demand, upgrades, malfunctions, scheduled
                or unscheduled maintenance, or other reasons. Some jurisdictions do not
                allow the exclusion of implied warranties, so portions of this disclaimer
                may not apply to you.
            </p>
        ),
    },
    {
        id: 'liability',
        title: '15. Limitation of Liability',
        content: (
            <>
                <p>
                    To the maximum extent permitted by law, GroGroJello will not be
                    liable to you or any third party claiming through you for any
                    indirect, incidental, special, consequential, exemplary, or punitive
                    damages arising from or related to access to, use of, inability to
                    access, or inability to use the Service, regardless of the theory of
                    liability.
                </p>
                <p>
                    This includes damages arising from inability to use the Service,
                    inaccurate results, lost profits, business interruption, loss or
                    corruption of data, the cost of recovering data, the cost of
                    substitute services, or damage to computers, software, modems,
                    telephones, or other property, even if GroGroJello was advised in
                    advance of the possibility of such damages.
                </p>
                <p>
                    To the maximum extent permitted by law, GroGroJello&apos;s total
                    liability for all claims will not exceed the amount you paid to
                    GroGroJello for the Service during the 12 months preceding the first
                    event giving rise to liability.
                </p>
            </>
        ),
    },
    {
        id: 'termination',
        title: '16. Termination',
        content: (
            <p>
                GroGroJello may terminate your access to and use of the Service at any
                time for any reason, effective immediately, in which case your right to
                use the Service will cease. You may terminate your GroGroJello account
                at any time by following the instructions made available through the
                Service. Sections 1, 6, 8, and 10 through 27 survive termination.
            </p>
        ),
    },
    {
        id: 'service-content',
        title: '17. Rights in Service Content and Activity Materials',
        content: (
            <p>
                All content available through the Service, including design, text,
                graphics, images, information, software, audio, and other files, and the
                selection and arrangement of those materials ("Service Content"), is the
                exclusive property of GroGroJello or its licensors. Except as expressly
                permitted in these Terms, no Service Content may be modified, copied,
                distributed, framed, reproduced, republished, downloaded, scraped,
                displayed, posted, transmitted, or sold in any form or by any means.
                Data mining, robots, scraping, and similar extraction methods are
                prohibited. All data, information, and materials generated through your
                access to and use of educational activities provided through the Service,
                including translated content created by you ("Activity Materials"), are
                owned solely by GroGroJello, and you hereby assign all rights in those
                materials to GroGroJello.
            </p>
        ),
    },
    {
        id: 'trademarks',
        title: '18. Trademarks',
        content: (
            <p>
                "GroGroJello" and all related trademarks, service marks, graphics, and
                logos used in connection with the Service are trademarks or service
                marks of GroGroJello or their respective owners. Your access to and use
                of the Service do not grant you any right or license to reproduce or
                otherwise use any GroGroJello or third-party name, trademark, service
                mark, graphic, or logo.
            </p>
        ),
    },
    {
        id: 'privacy',
        title: '19. Privacy',
        content: (
            <p>
                Your use of the Service is also subject to our Privacy Policy, available
                at{' '}
                <a href="https://www.grogrojello.com/privacy" target="_blank" rel="noreferrer">
                    www.grogrojello.com/privacy
                </a>
                . By using the Service, you agree to the terms of the Privacy Policy.
            </p>
        ),
    },
    {
        id: 'promotion-codes',
        title: '20. Promotion Code Terms',
        content: (
            <>
                <p>
                    GroGroJello may provide redeemable codes for certain Services
                    ("Promotion Codes"). Unless otherwise stated, Promotion Codes are
                    subject to these Terms in addition to any separately disclosed
                    conditions.
                </p>
                <p>
                    In some cases, you may receive a Promotion Code from an authorized
                    third party, such as an employer or another business ("Code
                    Provider"). A Code Provider may impose additional restrictions on
                    eligibility or terminate your use of the Promotion Code.
                </p>
                <p>
                    If you redeem a Promotion Code from a Code Provider, you understand
                    and agree that GroGroJello may share data related to your use of the
                    Promotion Code with that Code Provider, including anonymized
                    aggregate data and user-specific usage data.
                </p>
                <p>Promotion Codes may include:</p>
                <ul>
                    <li>codes for virtual items; and</li>
                    <li>
                        prepaid subscription or fixed-term access plan codes. Existing
                        GroGroJello subscribers may not redeem prepaid codes.
                    </li>
                </ul>
            </>
        ),
    },
    {
        id: 'governing-law',
        title: '21. Governing Law',
        content: (
            <p>
                These Terms are governed by and interpreted in accordance with the laws
                of the Republic of Korea, regardless of your country of origin or the
                location from which you access the Service.
            </p>
        ),
    },
    {
        id: 'venue',
        title: '22. Choice of Court',
        content: (
            <p>
                Any judicial proceeding arising out of or relating to these Terms or the
                Service shall be brought in the Seoul Central District Court of the
                Republic of Korea, or the court having jurisdiction over your place of
                residence, as the court of first instance. Each party consents to the
                jurisdiction of those courts and waives any objection to venue.
            </p>
        ),
    },
    {
        id: 'dispute-resolution',
        title: '23. Dispute Resolution and Arbitration',
        content: (
            <>
                <p>
                    If a dispute arises out of or relating to these Terms or the
                    Service, you and the company must first attempt to resolve the
                    dispute in good faith through consultation.
                </p>
                <p>
                    The party seeking resolution must provide written notice by email or
                    registered mail describing the nature of the claim, its basis, and
                    the specific relief requested.
                </p>
                <p>
                    If the claim falls within the jurisdictional scope of a small claims
                    court, either party may use the applicable small claims procedure.
                </p>
                <p>
                    Notwithstanding the foregoing, either party may seek injunctive or
                    emergency relief in a court of competent jurisdiction to prevent
                    infringement of rights.
                </p>
            </>
        ),
    },
    {
        id: 'miscellaneous',
        title: '24. Miscellaneous',
        content: (
            <p>
                These Terms constitute the entire agreement between you and GroGroJello
                regarding the subject matter hereof. If any provision is held to be
                unenforceable by a court or other tribunal of competent jurisdiction,
                that provision will be limited or eliminated to the minimum extent
                necessary so that the remaining provisions remain in full force and
                effect. A failure by either party to enforce any provision or respond to
                a breach does not waive future enforcement of that or any other
                provision. GroGroJello may assign its rights or obligations under these
                Terms without restriction. These Terms are binding upon and inure to the
                benefit of the parties and their respective successors and assigns.
            </p>
        ),
    },
];

const koreanSections: TermsSection[] = [
    {
        id: 'general',
        title: '1. 일반',
        content: (
            <>
                <p>
                    GroGroJello 웹사이트("Websites"), 모바일 애플리케이션("Apps"), 및 관련
                    서비스(이하 Websites 및 Apps를 포함하여 총칭하여 "Service")는
                    GroGroJello("GroGroJello", "당사", "우리")가 운영합니다. Service에 대한
                    접근 및 사용은 아래의 서비스 약관("Terms and Conditions")에 따릅니다.
                    Service의 일부분이라도 접근하거나 사용하는 경우, 귀하는 본 서비스 약관
                    (향후 개정 사항 포함)에 구속되는 데 동의한 것으로 간주됩니다.
                </p>
                <p>
                    GroGroJello는 본 서비스 약관을 수정, 업데이트 또는 변경할 수 있습니다.
                    이 경우, Service 약관의 변경 사실을 Websites에 최소 7일간 공지하고,
                    본 약관 하단에 최종 개정일을 표시합니다. 본 서비스 약관의 개정은
                    (i) 위 7일의 공지기간 만료 시점 또는 (ii) 그러한 변경 이후 귀하가
                    Service에 최초로 접근 또는 사용하는 시점 중 빠른 때에 효력이
                    발생합니다. 귀하가 본 서비스 약관을 준수하는 데 동의하지 않는 경우,
                    Service를 사용할 권한이 없습니다.
                </p>
                <p>
                    유의: 본 서비스 약관에는 특정 상황에서 배심 재판이나 집단 소송이
                    아닌, 개별 단위의 중재를 요구하는 의무적 분쟁 해결 조항이 포함되어
                    있습니다.
                </p>
            </>
        ),
    },
    {
        id: 'description',
        title: '2. 웹사이트 및 서비스의 설명',
        content: (
            <p>
                Service는 사용자가 다양한 교육 서비스를 이용할 수 있도록 하며, 여기에
                수학 학습 또는 연습이 포함될 수 있습니다. GroGroJello는 재량에 따라
                언제든지 Service의 전부 또는 일부를 업데이트, 변경, 일시 중단, 개선 또는
                중단(영구적 또는 일시적)할 수 있습니다.
            </p>
        ),
    },
    {
        id: 'permitted-use',
        title: '3. 서비스의 허용 사용',
        content: (
            <>
                <p>
                    귀하는 Service 사용에 대해, 그리고 귀하의 계정을 통해 이루어지는
                    모든 사용에 대해 책임을 부담합니다. 당사의 목표는 긍정적이고
                    유용하며 안전한 사용자 경험을 제공하는 것입니다. 이를 위해 다른
                    사용자 또는 당사에 해를 끼칠 수 있는 특정 행위를 금지합니다.
                </p>
                <p>Service를 사용할 때는 당사의 커뮤니티 가이드라인을 준수해야 합니다.</p>
            </>
        ),
    },
    {
        id: 'additional-terms',
        title: '4. 추가 약관',
        content: (
            <p>
                일부 Service에는 추가적인 조건("Additional Terms")이 적용될 수
                있습니다. 특정 Service에 Additional Terms가 적용되는 경우, 해당 Service
                사용 중에 이를 열람할 수 있도록 제공합니다. 해당 Service를 사용함으로써
                귀하는 Additional Terms에 동의하게 됩니다.
            </p>
        ),
    },
    {
        id: 'registration',
        title: '5. 가입',
        content: (
            <p>
                Service에 가입하고 이를 사용하는 과정에서, 귀하는 (i) GroGroJello가
                요청하는 바에 따라 귀하 본인 및/또는 귀하의 조직에 관한 정확하고,
                최신이며, 완전한 정보를 제공하고, (ii) 비밀번호 및 귀하의 계정 보안과
                관련된 기타 정보의 기밀성을 유지하며, (iii) GroGroJello에 제공한 가입
                정보를 적시에 업데이트하여 정확성, 최신성 및 완전성을 유지하고, (iv)
                귀하의 계정 사용 및 귀하의 계정을 통해 이루어지는 모든 행위에 대해
                전적으로 책임을 진다는 데 동의합니다.
            </p>
        ),
    },
    {
        id: 'representations',
        title: '6. 귀하의 진술 및 보증',
        content: (
            <>
                <p>
                    귀하는 Service에 대한 접근 및 사용이 본 서비스 약관 및 미국과 기타
                    관련 관할권의 모든 적용 법률, 규칙 및 규정에 부합함을 GroGroJello에
                    진술하고 보증합니다. 여기에는 온라인 행위 또는 허용 가능한 콘텐츠에
                    관한 규정, 미국 및/또는 귀하가 거주하는 관할권으로부터 수출되는 데이터
                    또는 정보의 전송에 관한 규정이 포함됩니다.
                </p>
                <p>
                    또한 귀하는 Service를 통해 제출하는 모든 자료("Activity Materials"
                    및 "Content" 포함)를 귀하가 생성하였거나 소유하고 있으며, 해당
                    자료에 대한 사용 라이선스를 당사에 부여하거나 본 약관에 따라 당사에
                    양도할 권리를 보유하고 있음을 진술하고 보증합니다.
                </p>
                <p>
                    귀하는 다음 각 호에 해당하지 않음을 진술하고 보증합니다: (1)
                    포괄적인 미국 경제제재 또는 무역제재의 대상 국가 또는 지역의 법률에
                    따라 설립되었거나, 그곳에서 운영하거나, 통상 거주하지 않음, (2) 미
                    재무부 특별지정제재대상자 및 제재대상자 명단과 같은 금지 또는 제한
                    대상 명단에 기재되어 있지 않음, (3) 그 밖에 미국 제재의 대상이 아님.
                </p>
            </>
        ),
    },
    {
        id: 'content-submissions',
        title: '7. 콘텐츠 제출',
        content: (
            <>
                <p>
                    Service에 평점, 리뷰, 정보, 데이터, 텍스트, 사진, 오디오 클립,
                    시청각 저작물, 번역물, 플래시카드 또는 기타 자료(총칭하여 "Content")를
                    제출하는 조건으로, 귀하는 GroGroJello에게 전액 지급되었고, 로열티가
                    없으며, 영구적이고, 취소할 수 없고, 전 세계적이며, 비독점적이고,
                    양도 가능하며, 서브라이선스가 가능한 라이선스를 부여합니다. 이에 따라
                    GroGroJello는 해당 Content를 사용, 복제, 적응, 수정, 결합, 배포,
                    공개 표시 및 2차적 저작물 생성에 사용할 수 있습니다.
                </p>
                <p>
                    귀하는 Content를 Service에 제출한 이후에는 위 라이선스가 귀하에 의해
                    종료될 수 없음을 인정합니다. 또한 귀하는 귀하가 제출한 Content가
                    귀하 또는 GroGroJello, 그리고 본 서비스 약관에 따라 기술된 바와 같이
                    그 밖의 자에 의해 사용되는 데 필요한 법적 권리를 보유하고 있음을
                    진술합니다. 귀하는 다른 사용자가 해당 Content에 접근할 수 있으며,
                    그들 또는 GroGroJello가 Content의 비밀을 유지할 의무가 없음을
                    이해합니다.
                </p>
                <p>귀하는 다음 각 호에 해당하는 Content를 업로드, 표시 또는 제공하지 않습니다:</p>
                <ul>
                    <li>
                        법을 위반하거나 제3자의 권리를 침해하는 경우, 또는 명예훼손적,
                        비방적, 학대적, 위협적, 괴롭힘적, 혐오 표현이거나 불쾌감을 주는 경우
                    </li>
                    <li>
                        GroGroJello의 단독 판단에 따라 부적절하여 타인의 Service 이용을
                        제한 또는 방해하거나 GroGroJello 또는 사용자에게 해 또는 책임을
                        야기할 수 있는 경우
                    </li>
                    <li>GroGroJello의 커뮤니티 가이드라인을 위반하는 경우</li>
                </ul>
            </>
        ),
    },
    {
        id: 'indemnity',
        title: '8. GroGroJello에 대한 면책',
        content: (
            <p>
                귀하는 Service에 대한 접근 또는 사용, 당사에 대한 허위 진술 또는 본
                서비스 약관의 위반, 그리고 당사가 귀하에게 제공하는 어떠한 번역이
                부정확하거나 부적절하거나 그 밖의 어떠한 방식으로든 결함이 있다는 주장과
                관련하여 발생하는 모든 손실, 청구, 소송 원인, 의무, 책임 및 손해
                (변호사 비용 포함)에 대해 GroGroJello 및 그 이사, 임원, 직원, 계약자,
                대리인, 공급업체, 라이선서, 승계인 및 양수인을 방어하고 면책하며 해를
                미치지 않도록 할 것에 동의합니다.
            </p>
        ),
    },
    {
        id: 'app-license',
        title: '9. 앱에 대한 라이선스',
        content: (
            <>
                <p>
                    본 서비스 약관의 조건에 따라 GroGroJello는 귀하에게 각 App의 사본
                    1개를 오직 객체 코드 형태로만, 귀하가 소유하거나 통제하는 인터랙티브
                    무선 장치에서 다운로드, 설치 및 사용할 수 있는 비독점적이며 양도
                    불가능한 라이선스를 부여합니다.
                </p>
                <p>
                    귀하는 App의 전부 또는 일부에 대한 소스 코드를 역으로 도출하거나
                    도출을 시도할 수 없으며, 제3자가 그러한 소스 코드를 도출하거나
                    도출을 시도하도록 허용할 수 없고, 리버스 엔지니어링, 디컴파일,
                    디스어셈블 또는 번역을 할 수 없습니다. GroGroJello 및 그 라이선서는
                    App 및 그에 대한 변경, 수정 또는 수정 사항에 관한 모든 지식재산권 및
                    기타 권리를 소유하고 유지합니다.
                </p>
                <p>
                    귀하가 Google Play Store 또는 Apple App Store에서 App을 사용하는
                    경우에는 해당 스토어 조건도 적용될 수 있습니다. 귀하는 본 서비스
                    약관이 귀하와 GroGroJello 사이에서만 체결되며 Google 또는 Apple과는
                    체결되지 않았음을 인정하고 동의합니다.
                </p>
            </>
        ),
    },
    {
        id: 'in-app-purchases',
        title: '10. 인앱 구매',
        content: (
            <>
                <p>귀하는 서비스를 통해 다음 각 호의 상품을 구매할 수 있습니다.</p>
                <ul>
                    <li>
                        정기 구독권 (3개월 / 12개월): 자동 갱신되는 정기 구독을 구매하는
                        경우, 귀하가 구독을 해지할 때까지 귀하의 GroGroJello 계정으로
                        지속적으로 요금이 청구됩니다. 최초 구독 기간 이후 및 모든 후속
                        구독 기간 이후에도 귀하의 구독은 동일한 기간으로 자동 갱신됩니다.
                    </li>
                    <li>
                        기간제 이용권 (3개월 / 12개월): 이용권은 정해진 기간 동안만 서비스
                        접속 권한을 부여하며, 기간 종료 후 자동으로 갱신되거나 결제되지
                        않습니다.
                    </li>
                </ul>
                <p>
                    귀하가 12개월 구독권을 구매하는 경우, GroGroJello는 교육 기회 균등
                    실현을 위한 사회적 공헌 프로그램의 일환으로 저소득층 학생에게 해당
                    서비스 12개월 이용 권한(1인 계정) 1개를 기부하며, 귀하에게는 이를
                    기념하는 디지털 기부 인증서를 발행합니다.
                </p>
                <ul>
                    <li>
                        회사는 도움이 필요한 학생에게 직접 계정을 전달하거나, 공신력 있는
                        NGO, 비영리 단체 또는 교육 기관을 통해 간접적으로 계정을 배분하는
                        방식 중 하나를 선택하여 기부를 실행할 수 있습니다.
                    </li>
                    <li>
                        기부 프로세스의 관리 주체는 회사이며, 회사는 기부가 투명하고 목적에
                        맞게 수행되도록 관리할 의무를 가집니다.
                    </li>
                    <li>
                        본 기부 프로그램은 구매자에게 본인의 계정 외에 추가적인 서비스 이용
                        권한이나 계정 소유권을 부여하는 것이 아니며, 기부된 계정은 현금으로
                        환불되거나 타인에게 판매 또는 양도될 수 없습니다.
                    </li>
                </ul>
                <p>
                    귀하는 귀하 또는 귀하 명의로 등록된 GroGroJello 계정을 사용하는 자가
                    발생시킨 모든 수수료 및 적용 가능한 세금을 지불하는 데 동의합니다.
                    GroGroJello는 서비스를 통해 제공되는 상품 및 서비스의 가격을 언제든지
                    수정할 수 있습니다.
                </p>
            </>
        ),
    },
    {
        id: 'payment-processors',
        title: '11. 결제 처리자',
        content: (
            <p>
                Service와 관련하여 이루어지는 모든 금전 거래는 제3자가 처리하며, 해당
                제3자의 이용 약관, 개인정보 처리방침 및/또는 적용 가능한 결제 조건에
                따릅니다. GroGroJello는 시스템 다운타임이나 결제 서비스 중단을 포함하되
                이에 국한되지 않는 제3자 결제 처리자의 행위 또는 부작위에 대해 어떠한
                책임도 지지 않습니다.
            </p>
        ),
    },
    {
        id: 'refund-policy',
        title: '12. 환불 정책',
        content: (
            <>
                <p>
                    모든 결제는 원칙적으로 환불되지 않으며, 가상 아이템 또는 부분적으로
                    사용된 이용/구독 기간에 대한 환불이나 크레딧은 제공되지 않습니다.
                    다만, 귀하의 관할권 내 관련 법률에서 청약철회를 강제하거나 환불을
                    요구하는 경우는 해당 법령을 우선하여 적용합니다.
                </p>
                <p>
                    귀하가 유료 서비스를 구매한 후 콘텐츠를 전혀 이용하지 않은 경우,
                    결제일로부터 7일 이내에 청약철회를 요청할 수 있으며, 이 경우 전액
                    환불을 원칙으로 합니다.
                </p>
                <p>
                    12개월 구독권은 구매와 동시에 사회적 기부 절차가 연동되는 특수
                    상품으로, 서비스 이용을 개시하거나 디지털 기부 인증서가 발행된 경우
                    회사는 즉시 기부 이행 절차를 완료한 것으로 간주할 수 있습니다.
                </p>
                <p>
                    이용 개시 후 중도 해지 및 환불을 요청할 경우, 회사는 관련 법령에 따라
                    다음의 금액을 공제한 후 잔액을 환불할 수 있습니다.
                </p>
                <ul>
                    <li>
                        기부 이행에 소요된 실비, 이미 저소득층 학생에게 전달된 12개월 이용
                        계정의 원가 및 제반 비용
                    </li>
                    <li>이용한 기간에 비례한 이용료 (일할 계산)</li>
                    <li>총 결제 금액의 10% 위약금 (중도 해지 수수료)</li>
                </ul>
                <p>
                    환불이 진행되더라도 이미 학생에게 전달된 서비스 이용 권한은 철회되거나
                    취소되지 않습니다. 환불 완료 시, 해당 구매와 연계되어 발행된 디지털
                    기부 인증서는 즉시 효력을 상실합니다.
                </p>
                <p>다음 각 호의 경우에는 청약철회 및 환불이 제한될 수 있습니다.</p>
                <ul>
                    <li>구매 후 7일이 경과하거나, 디지털 콘텐츠의 일부를 이미 사용한 경우</li>
                    <li>가상 아이템(젬 등)을 일부라도 소진한 경우</li>
                    <li>기타 법령에 따라 청약철회 제한 사유에 해당하는 경우</li>
                </ul>
                <p>
                    귀하가 유료 서비스의 정기 구독을 해지하더라도, 이미 결제가 완료된
                    현재의 청구 기간이 종료될 때까지는 서비스의 모든 유료 기능을 계속해서
                    이용할 수 있습니다. 기간제 이용권의 경우 정해진 이용 기간이 만료되면
                    서비스 접근 권한이 자동으로 종료됩니다.
                </p>
                <p>
                    Apple 앱 스토어 또는 Google 플레이 스토어를 통해 유료 상품을 구매한
                    경우, 해당 결제와 환불 절차는 각 앱 스토어 운영사의 약관 및 결제
                    시스템에 따라 처리됩니다.
                </p>
            </>
        ),
    },
    {
        id: 'third-party',
        title: '13. 제3자 링크, 사이트 및 서비스',
        content: (
            <>
                <p>
                    Service에는 제3자 웹사이트, 광고주, 서비스, 특별 제안 또는 기타
                    행사나 활동에 대한 링크가 포함될 수 있으며, 이는 GroGroJello가
                    소유하거나 통제하지 않습니다. 당사는 이러한 제3자 사이트, 정보,
                    자료, 제품 또는 서비스에 대해 보증하거나 어떤 책임도 지지 않습니다.
                </p>
                <p>
                    귀하가 GroGroJello를 통해 제3자의 웹사이트, 서비스 또는 콘텐츠에
                    접근하는 경우, 본 서비스 약관 및 당사의 개인정보 처리방침은 해당
                    사용에 적용되지 않음을 이해합니다. 귀하는 제3자 웹사이트, 서비스 또는
                    콘텐츠의 사용으로 인해 발생하는 손해나 손실에 대해 GroGroJello가
                    직접적 또는 간접적으로 책임을 지지 않음을 명시적으로 인정하고
                    동의합니다.
                </p>
            </>
        ),
    },
    {
        id: 'disclaimer',
        title: '14. GroGroJello의 진술 또는 보증 부인',
        content: (
            <p>
                Service와 GroGroJello가 귀하에게 제공하는 기타 모든 정보, 재산 및 권리는
                있는 그대로("AS IS") 제공됩니다. GroGroJello 및 그 공급업체는 Service에
                관하여 명시적이거나 묵시적인 어떠한 진술이나 보증도 하지 않으며,
                상업성, 특정 목적에의 적합성, 비침해에 대한 보증을 포함하되 이에 국한하지
                않는 모든 진술 및 보증을 명시적으로 부인합니다. 서비스는 수요가 많은
                기간, 시스템 업그레이드, 오작동, 예정된/예정되지 않은 유지보수 또는
                기타 사유로 인해 접근 및 사용이 불가능할 수 있습니다.
            </p>
        ),
    },
    {
        id: 'liability',
        title: '15. 손해 유형의 제한/책임의 제한',
        content: (
            <>
                <p>
                    적용 법률이 허용하는 최대 한도 내에서, 어떤 경우에도 GroGroJello는
                    귀하 또는 귀하를 통해 청구하는 제3자에 대해 서비스에 대한 접근 또는
                    사용, 또는 접근 불가 또는 사용 불능과 관련하여 발생하는 간접적,
                    부수적, 특별, 결과적 또는 전형적 손해에 대해 책임을 지지 않습니다.
                </p>
                <p>
                    여기에는 서비스 사용 불가, 부정확한 결과, 이익 손실, 영업 중단,
                    데이터 손실, 데이터 복구 비용, 대체 서비스 비용 또는 컴퓨터,
                    소프트웨어, 모뎀, 전화기 또는 기타 재산에 대한 손상에 관한 제3자의
                    청구 등이 포함됩니다.
                </p>
                <p>
                    적용 법률이 허용하는 최대 한도 내에서, GroGroJello가 부담하는 총
                    책임은 책임의 원인이 된 최초 행위 발생 이전 12개월 동안 귀하가
                    Service에 대해 GroGroJello에 지불한 금액을 초과하지 않습니다.
                </p>
            </>
        ),
    },
    {
        id: 'termination',
        title: '16. 해지',
        content: (
            <p>
                GroGroJello는 언제든지 어떤 사유로든 귀하의 Service에 대한 접근 및
                사용을 즉시 해지할 수 있으며, 이 경우 귀하는 더 이상 Service를 사용할
                권리가 없습니다. 귀하는 Service 내에서 제공되는 안내에 따라 언제든지
                귀하의 GroGroJello 계정을 해지할 수 있습니다. 본 서비스 약관의 1, 6,
                8, 10-27항은 해지 후에도 존속합니다.
            </p>
        ),
    },
    {
        id: 'service-content',
        title: '17. 서비스 콘텐츠 및 활동 자료에 대한 권리',
        content: (
            <p>
                Service를 통해 이용 가능한 모든 콘텐츠(디자인, 텍스트, 그래픽, 이미지,
                정보, 소프트웨어, 오디오 및 기타 파일 및 그 선택과 배열 포함,
                "Service Content")는 GroGroJello 또는 그 라이선서의 독점적 재산입니다.
                본 서비스 약관에서 명시적으로 허용한 경우를 제외하고, 어떠한 Service
                Content도 수정, 복사, 배포, 복제, 재게시, 다운로드, 스크래핑, 표시,
                게시, 전송 또는 판매할 수 없습니다. Activity Materials에 관한 모든 권리
                역시 본 약관에 따라 GroGroJello에 귀속됩니다.
            </p>
        ),
    },
    {
        id: 'trademarks',
        title: '18. 상표',
        content: (
            <p>
                "GroGroJello" 및 Service와 관련하여 사용되는 모든 상표, 서비스 마크,
                그래픽 및 로고는 GroGroJello 또는 해당 권리자들의 상표 또는 서비스
                마크입니다. Service에 대한 접근 및 사용은 GroGroJello 또는 제3자의
                상표, 서비스 마크, 그래픽 또는 로고를 복제하거나 기타 방식으로 사용할
                권리 또는 라이선스를 부여하지 않습니다.
            </p>
        ),
    },
    {
        id: 'privacy',
        title: '19. 개인정보',
        content: (
            <p>
                Service의 사용에는 당사의 개인정보 처리방침이 또한 적용됩니다. 사본은{' '}
                <a href="https://www.grogrojello.com/privacy" target="_blank" rel="noreferrer">
                    www.grogrojello.com/privacy
                </a>
                에서 확인할 수 있습니다. Service를 사용함으로써 귀하는 개인정보
                처리방침의 조건에 동의하게 됩니다.
            </p>
        ),
    },
    {
        id: 'promotion-codes',
        title: '20. 프로모션 코드 약관',
        content: (
            <>
                <p>
                    GroGroJello는 특정 Service에 대해 교환 가능한 코드를 제공할 수
                    있습니다("Promotion Codes"). 별도로 고지되지 않는 한, Promotion
                    Codes는 다른 모든 서비스 약관과 더불어 아래 조건의 적용을 받습니다.
                </p>
                <p>
                    경우에 따라 귀하는 고용주 또는 다른 사업자와 같은 승인된 제3자
                    ("Code Provider")로부터 Promotion Code를 받을 수 있습니다. Code
                    Provider는 귀하의 Promotion Code 자격에 대한 추가 제한을 둘 수
                    있으며, 귀하의 Promotion Code 사용을 종료시킬 수 있습니다.
                </p>
                <p>
                    Code Provider로부터 Promotion Code를 교환하는 경우, GroGroJello가
                    귀하의 Promotion Code 사용과 관련된 데이터를 Code Provider와 공유할
                    수 있으며, 여기에는 익명화된 집계 데이터와 개인별 사용 데이터가
                    포함될 수 있음을 이해하고 동의합니다.
                </p>
                <p>Promotion Codes는 다음 유형을 포함할 수 있습니다.</p>
                <ul>
                    <li>Virtual Items에 대한 Promotion Codes</li>
                    <li>
                        GroGroJello 구독 또는 기간제 이용권 플랜의 선불 구독에 대한
                        Promotion Codes. 기존 GroGroJello 구독자는 선불 코드를 교환할 수
                        없습니다.
                    </li>
                </ul>
            </>
        ),
    },
    {
        id: 'governing-law',
        title: '21. 준거법',
        content: (
            <p>
                본 서비스 약관은 대한민국 법률에 따라 규율 및 해석됩니다. 귀하의 출신
                국가 또는 서비스에 접속하는 위치와 관계없이 동일합니다.
            </p>
        ),
    },
    {
        id: 'venue',
        title: '22. 관할 법원 선택',
        content: (
            <p>
                본 서비스 약관 또는 서비스와 관련하여 발생하는 모든 분쟁에 대한 사법
                절차는 대한민국 서울중앙지방법원(또는 귀하의 주소지 관할 법원)을 제1심
                관할 법원으로 합니다. 양 당사자는 해당 법원의 관할권에 동의하며,
                법정지에 대한 모든 이의를 포기합니다.
            </p>
        ),
    },
    {
        id: 'dispute-resolution',
        title: '23. 분쟁 해결 및 중재',
        content: (
            <>
                <p>
                    본 서비스 약관 또는 서비스와 관련하여 분쟁이 발생할 경우, 회사와
                    귀하는 분쟁의 원만한 해결을 위해 먼저 선의의 협의를 진행해야 합니다.
                </p>
                <p>
                    분쟁 해결을 원하는 당사자는 상대방에게 서면(이메일 또는 등기우편)으로
                    청구의 성격, 근거 및 구체적인 구제 내용을 포함한 통지를 발송해야
                    합니다.
                </p>
                <p>
                    청구가 소액재판 관할법원의 범위 내에 해당하는 경우, 당사자는 관련
                    법령에 따른 소액재판 절차를 이용할 수 있습니다.
                </p>
                <p>
                    위 규정에도 불구하고, 권리 침해를 방지하기 위한 금지명령 또는 긴급
                    구제가 필요한 경우 어느 당사자든지 관할 법원에 이를 신청할 수
                    있습니다.
                </p>
            </>
        ),
    },
    {
        id: 'miscellaneous',
        title: '24. 기타',
        content: (
            <p>
                본 서비스 약관은 본 건과 관련하여 GroGroJello와 귀하 간의 완전한 합의를
                구성합니다. 본 서비스 약관의 어떠한 조항이 집행 불능으로 판단되는 경우,
                해당 조항은 본 약관의 나머지 부분이 계속 유효하도록 필요한 최소한의
                범위로 제한되거나 삭제됩니다. GroGroJello 또는 귀하가 특정 조항 또는
                위반에 대해 한 번 권리를 행사하지 않거나 포기하더라도, 이는 향후의 동일
                또는 유사한 조항 또는 위반에 대한 권리 포기로 간주되지 않습니다.
                GroGroJello는 본 서비스 약관에 따른 권리 또는 의무를 조건 없이 양도할 수
                있습니다.
            </p>
        ),
    },
];

export const TermsOfServicePage: React.FC = () => {
    const [locale, setLocale] = React.useState<Locale>('en');

    const sections = locale === 'ko' ? koreanSections : englishSections;
    const eyebrow = locale === 'ko' ? 'GroGroJello 법률' : 'GroGroJello Legal';
    const title = locale === 'ko' ? '서비스 약관' : 'Terms of Service';
    const footerText =
        locale === 'ko'
            ? '이 코드베이스 기준 마지막 반영일: 2026년 4월 15일'
            : 'Last translated and published in this codebase on April 15, 2026.';

    return (
        <div className="terms-page">
            <div className="terms-page__hero">
                <div className="terms-page__hero-inner">
                    <div className="terms-page__toolbar">
                        <div>
                            <p className="terms-page__eyebrow">{eyebrow}</p>
                            <h1>{title}</h1>
                        </div>

                        <label className="terms-page__language-picker">
                            <span className="terms-page__language-label">
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

            <main className="terms-page__content" role="main">
                <div className="terms-page__content-inner">
                    <article className="terms-document" aria-label={title}>
                        {sections.map((section) => (
                            <section key={section.id} className="terms-section" id={section.id}>
                                <h2>{section.title}</h2>
                                <div className="terms-section__body">{section.content}</div>
                            </section>
                        ))}
                    </article>

                    <footer className="terms-page__footer">
                        <p>{footerText}</p>
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default TermsOfServicePage;
