# 에셋 관리 가이드 (Assets Management)

> **버전**: 2.1
> **최종 업데이트**: 2025-11-25
> **작성자**: Gemini

## 1. 에셋 관리 정책

**본 프로젝트는 캐릭터 이미지를 포함한 주요 에셋을 외부 URL을 통해 관리하는 것을 표준 정책으로 합니다.**

### 정책의 근거
- **경량 저장소**: 이미지 파일을 저장소에 직접 포함시키지 않아 Git 리포지토리의 크기를 작고 가볍게 유지합니다.
- **CDN 활용**: `blogger.googleusercontent.com`과 같은 외부 CDN을 활용하여 에셋 로딩을 처리합니다.

이 정책에 따라, 모든 팀원은 외부 URL을 사용하여 에셋을 추가하고 관리하는 절차를 숙지해야 합니다.

## 2. 위험 관리 방안

외부 URL 사용 정책은 서비스의 안정성에 영향을 줄 수 있는 내재적 위험을 가지고 있습니다. 따라서 다음과 같은 위험 관리 방안을 반드시 준수해야 합니다.

- **URL 유효성**: 외부 서비스의 정책 변경이나 장애로 인해 URL이 비활성화될 수 있습니다.
- **백업 부재**: 프로젝트 저장소에 원본 파일이 없어, 외부 서비스에 문제가 생기면 에셋을 유실할 수 있습니다.

### 필수 준수 사항
1.  **인벤토리 유지보수**: 모든 외부 URL은 이 문서의 **인벤토리 섹션에 반드시 기록**되어야 합니다.
2.  **정기적인 유효성 검사**: 아래 제공된 스크립트를 사용하여 모든 URL이 활성 상태인지 주기적으로 검사해야 합니다.
3.  **로컬 백업**: 새로운 에셋을 외부 서비스에 업로드하는 담당자는 **자신의 로컬 환경에 원본 이미지 파일을 반드시 백업**해야 합니다.

## 3. 신규 에셋 추가 절차

새로운 캐릭터 이미지를 추가할 때는 다음 절차를 따릅니다.

1.  **외부 업로드**: 이미지를 `blogger.googleusercontent.com` 또는 지정된 외부 서비스에 업로드합니다.
2.  **URL 확보**: 업로드된 이미지의 고정 URL을 확보합니다.
3.  **코드 반영**: 캐릭터의 `.tsx` 컴포넌트 파일에 해당 URL을 추가합니다.
4.  **인벤토리 업데이트**: **가장 중요한 단계**로, 이 `ASSETS.md` 파일의 인벤토리 목록에 새로운 에셋 정보를 추가합니다.

## 4. 외부 이미지 인벤토리

이 목록은 프로젝트의 모든 외부 에셋을 추적하는 중앙 레지스트리입니다.

### 1단계 기본 캐릭터 (12개)
| 캐릭터 | 파일 위치 | 외부 URL |
| :--- | :--- | :--- |
| RedJello | `base/RedJello/RedJello.tsx` | https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgC4hy1fOzO4iZ75moVbVu4SqZVuJRs-dmNl59RLkrbRhDLJC6qhq1qNLVD9upZN1CUHLhmu4GVZAJVq37jrFiQE6aPBDS0Z6VaFbw_GjJFN205jgfy2R6T4Z-z1ZH9No2kALcWmZxjM668DSpctXoP7jXUUXDHkYjo_5GiQzHpkC8q2DpWPHzBjR1GSbc/s185/slime1-2.png |
| YellowJello | `base/YellowJello/YellowJello.tsx` | https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhM7Keo6QrfjhrWbe5uy3bcIYBoj-YWGloRPfBcRxC8Ch1Vz5dMZBlY-PvuKGXPMOr-etzKr5rdCf_rTgeiRtUjZ6rIpH0Po4_TWOTmsWFccuqfubA8C8pnV9Eo0WVPDMertRrtzlT3AUoQSWjM8rReHkXAyKiDl6zBqoxvLtD9kEu7svHr6qInSX5x9IM/s185/slime1-1.png |
| LimeJello | `base/LimeJello/LimeJello.tsx` | https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEig6r3HEDxxXAk6VWVHQRCL3vd7iqiTWnx4q9eaYTlncxp91sG7uptGjQkDSCXhQT1nzLu6P8XuwurCXFWoN0WP26wXATdi8_SIseCPSDIq5djcXtwdW1YZCj_B6CDhuXn5arhz_ZV1V2XPXy-9DaVe2J_BXf1dQepfYq5KkrjyD23KvxaON2yOe0RIsHk/s185/slime1-3.png |
| MintJello | `base/MintJello/MintJello.tsx` | https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg14xQR92IIXYOmxM0ykDxQT0FOB0qS51P3U_zme8m7x-YItAVFHslH8ELNnoaeu1_HnifLRXYoKJBBJTgMWWqM3nyEiZhBI4BNCOMqINk4ZGuzJWfiJN9CuYDjlRDRQLtZL5V1Uu4VCwEq9yKe4EtF-YMd9XI6-DylHuEp9ztIRyf9ylsb49qSCmsqNJQ/s185/slime1-4.png |
| BlueJello | `base/BlueJello/BlueJello.tsx` | https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj7B_XMYTTfjPCJW_YFMpN-pcTn7bVvTlcifAcNTJuwLMW5OgWXnCWcQUj_1UAR-NbAO9K8-hC1tqQn0KFYAgwwMayCAQL_SWwXPBWGp6DlaiFcN0nHGPS3do1FGYngJJPdaef-O_cym23QUYhypCatxKve4cIGgwuoCsJ66gwFIjc9gfMy-TGAnvCTK7A/s185/slime1-5.png |
| CreamJello | `base/CreamJello/CreamJello.tsx` | https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh4aUYzuEalEiBRhGQIdLhwmDS5C-LYRRY5e9lIqrsabn2DWJZpjp8OAxNC1iXhODd8AUcLLHZFRrsZm45hX00S-5xLENf8ZaDDmNK_EZFtkSpdb_UmGly9RHSn-qODdi8Y9pnBSVa5OX8KyKKFv_XHqBdCQI9UZoveyc6i46wRYNNg_iEev-7_OohOJzM/s185/slime1-6.png |
| PurpleJello | `base/PurpleJello/PurpleJello.tsx` | https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjItO-N-JseI-Wgy8_2rcjrqFLMTKzXZfy6QA-aFybdohVYcQ9ZJ_PiK957_y_yePXr6lHEsDuMaxrSpDFTO_8cbqvQ7yGoq6Rg_lxGPPZmGzQuJa-8LZJOcwzTWt8nWcWYZIoFOfj5H1E7tkVRylBf0vRRl78isbHjb2Zx39twSm9rSEHhA_cYry0WbB8/s185/slime1-7.png |
| SkyJello | `base/SkyJello/SkyJello.tsx` | https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhXti4v3wpGoB_7e3moZaDMuLcAN5jIA9zMoC2z8-NZBrAaumNI9B2MXmYzk3caK2tevCNW93esU2c0PhWt3_1sE3Dt1uuS3fzFjxSalUc-sSA47oN7HYlC99t6bGYMrDJAuIqBMmPbdGetz9eE765BUxEKGu88xBXQ0oA_GchUZSehA_r2iNbvY_N5xOA/s185/slime1-8.png |
| BrownJello | `base/BrownJello/BrownJello.tsx` | https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEinUxaEzVZ55RlAAXx1Eq-vInQgnsWHAkpDzTEExCk5_OtnyN6sqHnSrV4bj1Ik5RD7fsQJ6to-dUVjuE5h0i5lDcwooSAoQecXq4sRo2qCaa3lm8BYeIAHF8rVl_2KNf6voI56_MCMaR1cd7VYkeYkBzOrbxH34HbenTjUeyojh0OMOaMmFx4Z73YUN7E/s185/slime1-9.png |
| OrangeJello | `base/OrangeJello/OrangeJello.tsx` | https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj28Cl04ywwqUP12JIEGGMmufZfb6WdpiKr5KmgJVkKwzGROZfhsxlJVI32_unEgNF0dCT8SQ85pqhfbUadz50q5tkZo1KQEpj2ljlnE2S4ePkLgYV6pbIMZdVpHeXHdn1lClwMukmKy_3tPzQWJhepbOSwvgtYYgxO0tg39pd-IZWU4YJBrSUZrLT_xTE/s185/slime1-10.png |
| OliveJello | `base/OliveJello/OliveJello.tsx` | https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEixFBIj75hUyV-YctAYsyfzbvVdnRqONwGjkYdBX9d-qITWc0_WplcMO5Uu0zke8BSYUbzus9iVxQRZg0R_4vPzDvKfdFhbKwAqN5MhtyfGpUZEirwJCWyYD8XqquPQvKVtYESPnLrarRFOmhafU1eSqd-b0lZlvBDVpSjZEXKPqZty9_gET-oTYdhQgZQ/s185/slime1-11.png |
| CyanJello | `base/CyanJello/CyanJello.tsx` | https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiqSZ-leyjYYOA5vxDETyeug2-WupGIBKUeaZDyws9Ox4bVUBiLJC_GjCJ-KWRQH2ZKD-92PaB3MdvDMZ1FWM9LQ_sEsfVnw7Lsctu-6x8yviTXNOjp_BtywVWhCNFm9hfYafCeNQUk_4WuMwCFqYxlBslCnS2VkEDpm_9APEgLS2MIeSPdIkMAMaVHf_E/s185/slime1-12.png |

### 2단계 진화 캐릭터 (12개)
| 캐릭터 | 파일 위치 | 외부 URL |
| :--- | :--- | :--- |
| YellowPearJello | `evolved/stage2/YellowPearJello/YellowPearJello.tsx` | https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi2d655-Ej8OMl0zMy1iR4xbW0kIt4XbHTRM4RcWeXJCviiDccq02FrW9-g2PhYy_6XQKUkcpG8ZaEP_NvMQKqCconpvUB9oKPVWKn_dw91-kViFi4OJ5QsmcMf3RC66CETjCo8SzFJofbQQ6Tes2r7A2BTokwF2A4oiN9EqAqvBG1VPvaZ1z7OE_syqo4/s185/slime2-1.png |
| RedDevilJello | `evolved/stage2/RedDevilJello/RedDevilJello.tsx` | https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhp32ZLTCN7v04cZ5Ig64f9WjH-xujSHYA4AOjfgLv-cK4TxSQKiNZe4qd_ydhNUS9MkadJQi3VLy9CnhIKAzoCcyLOwfbUDxgfJvuXb9xMbdRJfxjwmYzE1S3d8mVGXXsCs-8Z_3Rp6r2DBPIpKAjiT95WM6Tx3BSepPrBfDstc6-BcuS-kmr-CCW7U10/s185/slime2-2.png |
| LimeLeafJello | `evolved/stage2/LimeLeafJello/LimeLeafJello.tsx` | https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhj6PDZAYEH09Nj20JvPK9ryFUJVUe91H_Us6DXjLvMKTtHbktwmg9Kzv6KNzuWrxNffuQqcDID2tzPxmsQ78zQHAu82R_phzxDDSbmHv8E_DdoqbBZ5HUlPjzXPWZVgHiollFLGO16Dz_rP2Wymlj1s0TjXHLMZPJYXkR1uA-1n4bXcQ9ALDCJJYw8UiY/s185/slime2-3.png |
| MintSproutJello | `evolved/stage2/MintSproutJello/MintSproutJello.tsx` | https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi9-rg4HfHQPf6_wKf4TBUBgOPsuYIodqpZqYlo12ESDFwFqhH54Msn1S5LUI9716t7RdGaYtqnBOXnPV6spZppjWrX9ruII42Vy9DFvFmmM5UN4b1yfxAMM1Y_vGV57_500tM9b0_k3KnxTrxKcI8UU38lVn0VEWTlED6uAhflbKcegCp9cFg0u2wACiY/s185/slime2-4.png |
| BlueCatJello | `evolved/stage2/BlueCatJello/BlueCatJello.tsx` | https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhe6qH-LhW6p_KwMKSLg9r8bW_wVPFNfw8guWawO6JdgucI4ZwEFF_QbPJ1Rhc6TUDsVhE821v0iy7OhnB4SYSSNn-oaQPZkzrJlocIlfS0Am_xlHiHk_Y0QEjXutBh6Bfxl5_Jqqyto7IRPyNyMQvPm7yMo0nozCzTtRjoJlKogfGCm2MsGWdv5q1v2Ss/s185/slime2-5.png |
| CreamRamJello | `evolved/stage2/CreamRamJello/CreamRamJello.tsx` | https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEigmCpQRvEKBaOpqF_3MOvmPO9lFbVjjdZACeMWmuJDj4Lg8asAo_zIISalNjI1-ZazzK9QIUbKZitBa5-D-yn-5jXBMOqNie4A8cCixKH6kyyDk8gOhkPPdHl_3y9S_TkeABJmAQE69lNeNoW0NbJi0i0SE0mS5Nj5paGf1caIpzO1XSR0T29svcDtSEg/s185/slime2-6.png |
| PurpleImpJello | `evolved/stage2/PurpleImpJello/PurpleImpJello.tsx` | https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjGejlMFcT2eN6pnXQoc4JnpRw4vdv1XZn0vt5bUIhFL0qil2Y4-Nbm9VBlGSckmknYKlFl2As_nl0SSRsN68Vzwkp7WK4TcPXWQ4rrlnir4pySt1CxXAi4rlZ5FP1Ls0yPmzYPQbxLVlCcBswIgJrxfnZQVe6LGgL_QkeJGMhUbZVSc0QLiee7_gyY628/s185/slime2-7.png |
| SkyLynxJello | `evolved/stage2/SkyLynxJello/SkyLynxJello.tsx` | https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjwnL8Nono0eu4QpBtYMEslpToXOvKz9Amq8IXmQJS-OwUPOo0BbRnY1vph5dRkVLT4m1OwNm42oWWWN5WDgTh1zYn0kb0nCp5_BO40D1oObAnk1iiQ3vyB2tlSlUKq73CjDVrm7nu3cRZyk-OfaBL4llebH5MZXjD29GfiWINMdumi31EowDcRatTOkC4/s185/slime2-8.png |
| BrownWillowJello | `evolved/stage2/BrownWillowJello/BrownWillowJello.tsx` | https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgDpr48AJ1Ft8L5w5oH6NpGQbC5ZlADb2QQHdx3alY2F0Cf6O3vMge-3NhSWBI0JHWp_uC9YXNJvmlPdfalNQpDwFZMNpvf93ine4AmbolNmxo9Y8cJW7zhMz3-t4FIViqopDQk79yMDdBjVkCZ5lN8hOGlZVJNDAJR2iLXBhYegq_wJginOybPOHwub5M/s185/slime2-9.png |
| OrangeTailJello | `evolved/stage2/OrangeTailJello/OrangeTailJello.tsx` | https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi2MzUtZQes6HJdIo2Br9xAHxzSusknmuGaSPjjMVgwjtE_HM2UMm5_AaDijgC90TsHM1VDBe0V4dD-6vtmN9065aSUZckSq6dvpEiAkMl0myM9BmGk_uB0MLzjDh_oGnKzWSNZSRWBzeHTOniaqCcLYasdzNYgnCuTiXuiN3j-qFYjeoNdFKybUhqvHPM/s185/slime2-10.png |
| OliveBloomJello | `evolved/stage2/OliveBloomJello/OliveBloomJello.tsx` | https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgfyE-JKM4RHCQu2kC9Q62silTEfqFndoEbFzjJH_z-c6tHfVgt8blUxHJe_1mNh-jf5DqOyM7VxIYc1kCjKYLdirJ0o7E0ilYrcUHJq1JR5Uk9hqTmeDkgowW4KTQiArA0Pm2NRBQMLYVGDowT2qTAcIAgSwLxOAI0-xKJHA6czO6lLcwOO_BDixoHbGc/s185/slime2-11.png |
| CyanGhostJello | `evolved/stage2/CyanGhostJello/CyanGhostJello.tsx` | https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhNoipg52Zphysnu6GwJkRN93K2Bg1idSdXDWBwdK-pE3yAjCoP3dbAqpAbF8sSPtsr8JWGN3r9U3Rx3H1JcQeHHJVQ4kb73JJGG2HJPuNwR9RfmWlI_vOMaxPg1ThntY3CQY9AgWQXHIAyATw4ALSqoiT5s0gNHLTy6m37cW5krZIkH94rjR0pjnjpkmQ/s185/slime2-12.png |

## 5. URL 유효성 검사 스크립트

프로젝트의 모든 외부 URL이 유효한지 확인하려면, 프로젝트 루트에서 아래 명령어를 실행하세요.

```bash
#!/bin/bash
echo "Checking external image URLs..."
URLS=$(grep -r "blogger.googleusercontent.com" src/ | grep -o 'https://[^'\'']+')

for url in $URLS; do
  CLEAN_URL=$(echo $url | sed 's/[',",']*$//')
  STATUS_CODE=$(curl -o /dev/null -s -w "%{http_code}" "$CLEAN_URL")
  
  if [ "$STATUS_CODE" -eq 200 ]; then
    echo "✅ OK ($STATUS_CODE): $CLEAN_URL"
  else
    echo "❌ FAILED ($STATUS_CODE): $CLEAN_URL"
  fi
done
echo "Check complete."
```