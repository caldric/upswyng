import React from 'react';
import { Button } from '@material-ui/core';
import { ButtonProps } from '@material-ui/core/Button';
import styled from 'styled-components';
import { colors, font } from '../App.styles';

interface HomeLinkPropsBase {
  children: React.ReactElement | React.ReactElement[];
  key: string;
}

interface HomeButtonProps extends ButtonProps {
  readonly buttonColor: string;
}

const HomeButton = styled((props: HomeButtonProps) => {
  const { buttonColor, ...rest } = props;
  return <Button {...rest} />;
})`
  && {
    align-items: stretch;
    background: ${(props: HomeButtonProps) =>
      props.buttonColor || colors.greyDark};
    border-radius: 0;
    color: ${colors.white};
    display: flex;
    padding: ${font.helpers.convertPixelsToRems(10)};
    text-decoration: none;
    width: 100%;
  }
  &&:hover {
    background: ${(props: HomeButtonProps) =>
      props.buttonColor || colors.greyDark};
    filter: brightness(95%);
  }
  > span {
    align-items: flex-start;
    display: flex;
    flex-direction: column;
    font-family: ${font.families.openSans};
    font-size: ${font.helpers.convertPixelsToRems(22)};
    font-weight: 700;
    justify-content: space-between;
    line-height: ${font.helpers.convertPixelsToRems(24)};
    text-transform: none;
  }
  svg {
    align-self: flex-end;
    height: auto;
    max-height: ${font.helpers.convertPixelsToRems(45)};
    width: ${font.helpers.convertPixelsToRems(42)};
  }
`;

export default HomeButton;